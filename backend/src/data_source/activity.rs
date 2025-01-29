use crate::{
    error::Error,
    wire::activity::{Activity, ActivityContent, ActivityId},
    AppState,
};

use crate::{
    activity::{Answer, Date, Hydrated, NewRegistration, Registration},
    auth::role::MembershipStatus,
    location::Location,
    user::{BasicUser, UserId},
    wire::activity::IdOnly,
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::{Executor, PgPool, Postgres};
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

pub(crate) struct ActivityStore {
    db: PgPool,
}

impl FromRequestParts<AppState> for ActivityStore {
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(Self {
            db: state.pool().clone(),
        })
    }
}

#[derive(Debug, Clone)]
struct PgActivity {
    id: Uuid,
    location_id: Uuid,
    location_name_en: String,
    location_name_nl: String,
    location_description_nl: Option<String>,
    location_description_en: Option<String>,
    name_nl: String,
    name_en: String,
    description_nl: Option<String>,
    description_en: Option<String>,
    start: Option<Vec<OffsetDateTime>>,
    end: Option<Vec<OffsetDateTime>>,
    registration_start: OffsetDateTime,
    registration_end: OffsetDateTime,
    registration_max: Option<i32>,
    waiting_list_max: Option<i32>,
    is_hidden: bool,
    required_membership_status: Option<Vec<MembershipStatus>>,
    activity_type: String,
    questions: serde_json::Value,
    metadata: serde_json::Value,
    registration_count: i64,
    waiting_list_count: i64,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgActivity> for Hydrated {
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        Ok(Self {
            location: Location {
                id: pg.location_id,
                name_nl: pg.location_name_nl,
                name_en: pg.location_name_en,
                description_nl: pg.location_description_nl,
                description_en: pg.location_description_en,
            },
        })
    }
}

impl TryFrom<PgActivity> for IdOnly {
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        Ok(Self {
            location_id: pg.location_id.into(),
        })
    }
}

impl<T> TryFrom<PgActivity> for Activity<T>
where
    T: TryFrom<PgActivity, Error = Error>,
    T: Validate,
{
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        let details = TryFrom::try_from(pg.clone())?;

        let dates = if let Some(start) = pg.start {
            start
                .into_iter()
                .zip(pg.end.expect(
                    "If we retrieve an vec of starts from the DB then there must also be ends",
                ))
                .map(|(start, end)| Date { start, end })
                .collect()
        } else {
            vec![]
        };

        Ok(Self {
            id: pg.id.into(),
            created: pg.created,
            updated: pg.updated,
            registration_count: pg.registration_count,
            waiting_list_count: pg.waiting_list_count,
            content: ActivityContent {
                name_nl: pg.name_nl,
                name_en: pg.name_en,
                description_nl: pg.description_nl,
                description_en: pg.description_en,
                registration_start: pg.registration_start,
                registration_end: pg.registration_end,
                registration_max: pg.registration_max,
                waiting_list_max: pg.waiting_list_max,
                is_hidden: pg.is_hidden,
                required_membership_status: pg.required_membership_status,
                activity_type: pg.activity_type.parse()?,
                dates,
                questions: serde_json::from_value(pg.questions)?,
                metadata: pg.metadata,
                details,
            },
        })
    }
}

struct PgRegistration {
    user_id: Uuid,
    first_name: String,
    infix: Option<String>,
    last_name: String,
    attended: Option<bool>,
    answers: serde_json::Value,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgRegistration> for Registration {
    type Error = Error;

    fn try_from(pg: PgRegistration) -> Result<Self, Self::Error> {
        Ok(Self {
            user: BasicUser {
                user_id: pg.user_id.into(),
                first_name: pg.first_name,
                infix: pg.infix,
                last_name: pg.last_name,
            },
            attended: pg.attended,
            answers: serde_json::from_value(pg.answers)?,
            created: pg.created,
            updated: pg.updated,
        })
    }
}

impl ActivityStore {
    pub async fn new_activity(
        &self,
        activity: ActivityContent<IdOnly>,
    ) -> Result<Activity<Hydrated>, Error> {
        let activity_id = Uuid::now_v7();

        let mut tx = self.db.begin().await?;

        sqlx::query!(
            r#"
            INSERT INTO activity (
                                  id,
                                  location_id,
                                  name_nl,
                                  name_en,
                                  description_nl,
                                  description_en,
                                  registration_start,
                                  registration_end,
                                  registration_max,
                                  waiting_list_max,
                                  is_hidden,
                                  required_membership_status,
                                  activity_type,
                                  questions,
                                  metadata,
                                  created,
                                  updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::membership_status[], $13, $14, $15, now(), now())
            "#,
            activity_id,
            *activity.details.location_id,
            activity.name_nl,
            activity.name_en,
            activity.description_nl,
            activity.description_en,
            activity.registration_start,
            activity.registration_end,
            activity.registration_max,
            activity.waiting_list_max,
            activity.is_hidden,
            activity.required_membership_status as Option<Vec<MembershipStatus>>,
            Into::<&str>::into(activity.activity_type),
            serde_json::to_value(activity.questions)?,
            activity.metadata
        ).execute(&mut *tx).await?;

        let (start, end) = activity.dates.into_iter().fold(
            (Vec::new(), Vec::new()),
            |(mut start, mut end), date| {
                start.push(date.start);
                end.push(date.end);
                (start, end)
            },
        );

        sqlx::query!(
            r#"
            INSERT INTO date (activity_id, start, "end") VALUES ($1, unnest($2::timestamptz[]), unnest($3::timestamptz[]))
            "#,
            activity_id,
            &start,
            &end
        )
            .execute(&mut *tx)
            .await?;

        let activity = Self::get_activity(&mut *tx, activity_id.into())
            .await
            .map_err(|err| Error::Internal(format!("{err:?}")))?;

        tx.commit().await?;

        Ok(activity)
    }

    pub async fn get_activity_hydrated(&self, id: ActivityId) -> Result<Activity<Hydrated>, Error> {
        Self::get_activity(&self.db, id).await
    }

    async fn get_activity<'c, E>(db: E, id: ActivityId) -> Result<Activity<Hydrated>, Error>
    where
        E: Executor<'c, Database = Postgres>,
    {
        dbg!(&id);
        sqlx::query_as!(
            PgActivity,
            r#"
            SELECT a.id,
                   l.id as location_id,
                   l.name_en as location_name_en,
                   l.name_nl as location_name_nl,
                   l.description_nl as location_description_nl,
                   l.description_en as location_description_en,
                   a.name_nl,
                   a.name_en,
                   a.description_nl,
                   a.description_en,
                   array_agg(d.start) as start,
                   array_agg(d."end") as "end",
                   a.registration_start,
                   a.registration_end,
                   a.registration_max,
                   a.waiting_list_max,
                   a.is_hidden,
                   a.required_membership_status as "required_membership_status:Vec<MembershipStatus>",
                   a.activity_type,
                   a.questions,
                   a.metadata,
                   count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NULL ) as "registration_count!",
                   count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NOT NULL ) as "waiting_list_count!",
                   a.created,
                   a.updated
            FROM activity a
                JOIN location l ON a.location_id = l.id
                JOIN date d ON a.id = d.activity_id 
                LEFT JOIN activity_registration r ON r.activity_id = a.id
            WHERE a.id = $1
            GROUP BY a.id, l.id
            "#,
            *id
        )
            .fetch_one(db)
            .await?
            .try_into()
    }

    pub async fn get_registered_users(&self, id: ActivityId) -> Result<Vec<BasicUser>, Error> {
        Ok(sqlx::query_as!(
            BasicUser,
            r#"
            SELECT u.id as user_id, u.first_name, u.infix, u.last_name
            FROM activity_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.activity_id = $1
            "#,
            *id
        )
        .fetch_all(&self.db)
        .await?)
    }

    pub async fn get_registrations_detailed(
        &self,
        id: ActivityId,
    ) -> Result<Vec<Registration>, Error> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT user_id, u.first_name, u.infix, u.last_name, answers, attended, u.created, u.updated
            FROM activity_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.activity_id = $1
            "#,
            *id
        )
            .fetch_all(&self.db)
            .await?
            .into_iter()
            .map(TryInto::try_into)
            .collect::<Result<Vec<Registration>, Error>>()
    }

    pub async fn get_registration(
        &self,
        activity_id: ActivityId,
        user_id: UserId,
    ) -> Result<Registration, Error> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT user_id, u.first_name, u.infix, u.last_name, answers, attended, u.created, u.updated
            FROM activity_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.activity_id = $1
              AND user_id = $2
            "#,
            *activity_id,
            *user_id
        ).fetch_one(&self.db).await?.try_into()
    }

    pub async fn new_registration(
        &self,
        activity_id: ActivityId,
        user_id: UserId,
        waiting_list_pos: Option<i32>,
        new: NewRegistration,
    ) -> Result<Registration, Error> {
        sqlx::query!(
            r#"
            INSERT INTO activity_registration (activity_id, user_id, waiting_list_position, answers, created, updated)
            VALUES ($1, $2, $3, $4, now(), now())
            "#,
            *activity_id,
            *user_id,
            waiting_list_pos,
            serde_json::to_value(new.answers)?
        )
        .execute(&self.db)
        .await?;
        self.get_registration(activity_id, user_id).await
    }

    pub async fn update_registration_answers(
        &self,
        activity_id: ActivityId,
        user_id: UserId,
        answers: Vec<Answer>,
    ) -> Result<Registration, Error> {
        sqlx::query!(
            r#"
            UPDATE activity_registration
            SET answers = $1,
                updated = now()
            WHERE activity_id = $2
              AND user_id = $3
            "#,
            serde_json::to_value(answers)?,
            *activity_id,
            *user_id
        )
        .execute(&self.db)
        .await?;
        self.get_registration(activity_id, user_id).await
    }

    pub async fn update_registration_attendance(
        &self,
        activity_id: ActivityId,
        user_id: UserId,
        attended: Option<bool>,
    ) -> Result<Registration, Error> {
        sqlx::query!(
            r#"
            UPDATE activity_registration
            SET attended = $1,
                updated = now()
            WHERE activity_id = $2
              AND user_id = $3
            "#,
            attended,
            *activity_id,
            *user_id
        )
        .execute(&self.db)
        .await?;
        self.get_registration(activity_id, user_id).await
    }
}
