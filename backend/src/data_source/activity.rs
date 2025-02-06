use crate::{
    error::Error,
    wire::activity::{Activity, ActivityContent, ActivityId},
    AppState, Language,
};

use crate::{
    activity::{Date, NewRegistration, Registration},
    auth::role::MembershipStatus,
    error::AppResult,
    location::{Location, LocationContent, LocationId},
    user::{BasicUser, UserId},
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::{Executor, PgConnection, PgPool, Postgres};
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

pub struct ActivityStore {
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
    location_reusable: bool,
    location_description_nl: Option<String>,
    location_description_en: Option<String>,
    location_created: OffsetDateTime,
    location_updated: OffsetDateTime,
    name_nl: String,
    name_en: String,
    image: Option<Uuid>,
    description_nl: Option<String>,
    description_en: Option<String>,
    start: Option<Vec<OffsetDateTime>>,
    end: Option<Vec<OffsetDateTime>>,
    registration_start: Option<OffsetDateTime>,
    registration_end: Option<OffsetDateTime>,
    registration_max: Option<i32>,
    waiting_list_max: Option<i32>,
    is_published: bool,
    required_membership_status: Vec<MembershipStatus>,
    activity_type: String,
    questions: serde_json::Value,
    metadata: serde_json::Value,
    registration_count: i64,
    waiting_list_count: i64,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgActivity> for Location {
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        Ok(Location {
            id: pg.location_id.into(),
            created: pg.location_created,
            updated: pg.location_updated,
            content: LocationContent {
                name: Language {
                    en: pg.location_name_en,
                    nl: pg.location_name_nl,
                },
                reusable: pg.location_reusable,
                description: pg.location_description_en.map(|en| Language {
                    en,
                    nl: pg.location_description_nl.expect(
                        "If a english description exists in the DB, there must also exist a dutch",
                    ),
                }),
            },
        })
    }
}

impl TryFrom<PgActivity> for LocationId {
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        Ok(pg.location_id.into())
    }
}

impl<T> TryFrom<PgActivity> for Activity<T>
where
    T: TryFrom<PgActivity, Error = Error>,
    T: Validate,
{
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        let location = TryFrom::try_from(pg.clone())?;

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
                name: Language {
                    en: pg.name_en,
                    nl: pg.name_nl,
                },
                image: pg.image.map(Into::into),
                description: pg.description_en.map(|en| Language {
                    en,
                    nl: pg.description_nl.expect(
                        "If a english description exists in the DB, there must also exist a dutch",
                    ),
                }),
                registration_period: pg.registration_start.map(|start| Date { start, end: pg.registration_end.expect("If a registration start exists in the DB, there must also be an registration end") }),
                registration_max: pg.registration_max,
                waiting_list_max: pg.waiting_list_max,
                is_published: pg.is_published,
                required_membership_status: pg.required_membership_status,
                activity_type: pg.activity_type.parse()?,
                dates,
                questions: serde_json::from_value(pg.questions)?,
                metadata: pg.metadata,
                location
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
    waiting_list_position: Option<i32>,
    answers: serde_json::Value,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgRegistration> for Registration {
    type Error = Error;

    fn try_from(pg: PgRegistration) -> AppResult<Self> {
        Ok(Self {
            user: BasicUser {
                user_id: pg.user_id.into(),
                first_name: pg.first_name,
                infix: pg.infix,
                last_name: pg.last_name,
            },
            attended: pg.attended,
            waiting_list_position: pg.waiting_list_position,
            answers: serde_json::from_value(pg.answers)?,
            created: pg.created,
            updated: pg.updated,
        })
    }
}

impl ActivityStore {
    pub async fn new_activity(
        &self,
        activity: ActivityContent<LocationId>,
        created_by: &UserId,
    ) -> AppResult<Activity<Location>> {
        let activity_id = Uuid::now_v7();

        let mut tx = self.db.begin().await?;

        sqlx::query!(
            r#"
            INSERT INTO activity (
                                  id,
                                  location_id,
                                  name_nl,
                                  name_en,
                                  image,
                                  description_nl,
                                  description_en,
                                  registration_start,
                                  registration_end,
                                  registration_max,
                                  waiting_list_max,
                                  is_published,
                                  required_membership_status,
                                  activity_type,
                                  questions,
                                  metadata,
                                  created_by,
                                  created,
                                  updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::membership_status[], $14, $15, $16, $17, now(), now())
            "#,
            activity_id,
            *activity.location,
            activity.name.nl,
            activity.name.en,
            activity.image.map(|id|*id),
            activity.description.as_ref().map(|l| l.nl.clone()),
            activity.description.map(|l| l.en),
            activity.registration_period.as_ref().map(|r| r.start),
            activity.registration_period.as_ref().map(|r| r.end),
            activity.registration_max,
            activity.waiting_list_max,
            activity.is_published,
            activity.required_membership_status as Vec<MembershipStatus>,
            Into::<&str>::into(activity.activity_type),
            serde_json::to_value(activity.questions)?,
            activity.metadata,
            **created_by
        ).execute(&mut *tx).await?;

        Self::add_dates_to_activity(&mut *tx, &activity_id.into(), &activity.dates).await?;

        let activity = Self::get_activity(&mut *tx, &activity_id.into(), true)
            .await
            .map_err(|err| Error::Internal(format!("{err:?}")))?;

        tx.commit().await?;

        Ok(activity)
    }

    pub async fn get_activity_hydrated(
        &self,
        id: &ActivityId,
        display_hidden: bool,
    ) -> AppResult<Activity<Location>> {
        Self::get_activity(&self.db, id, display_hidden).await
    }

    async fn get_activity<'c, E>(
        db: E,
        id: &ActivityId,
        display_hidden: bool,
    ) -> AppResult<Activity<Location>>
    where
        E: Executor<'c, Database = Postgres>,
    {
        sqlx::query_as!(
            PgActivity,
            r#"
            SELECT a.id,
                   l.id as location_id,
                   l.name_en as location_name_en,
                   l.name_nl as location_name_nl,
                   l.description_nl as location_description_nl,
                   l.description_en as location_description_en,
                   l.reusable as location_reusable,
                   l.created as location_created,
                   l.updated as location_updated,
                   a.name_nl,
                   a.name_en,
                   a.image,
                   a.description_nl,
                   a.description_en,
                   array_agg(d.start) as start,
                   array_agg(d."end") as "end",
                   a.registration_start,
                   a.registration_end,
                   a.registration_max,
                   a.waiting_list_max,
                   a.is_published,
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
            WHERE a.id = $1 AND 
                  (a.is_published OR $2)
            GROUP BY a.id, l.id
            "#,
            **id,
            display_hidden
        )
            .fetch_one(db)
            .await?
            .try_into()
    }

    pub async fn get_activities(&self, display_hidden: bool) -> AppResult<Vec<Activity<Location>>> {
        sqlx::query_as!(
            PgActivity,
            r#"
            SELECT a.id,
                   l.id as location_id,
                   l.name_en as location_name_en,
                   l.name_nl as location_name_nl,
                   l.description_nl as location_description_nl,
                   l.description_en as location_description_en,
                   l.reusable as location_reusable,
                   l.created as location_created,
                   l.updated as location_updated,
                   a.name_nl,
                   a.name_en,
                   a.image,
                   a.description_nl,
                   a.description_en,
                   array_agg(d.start) as start,
                   array_agg(d."end") as "end",
                   a.registration_start,
                   a.registration_end,
                   a.registration_max,
                   a.waiting_list_max,
                   a.is_published,
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
            WHERE a.is_published OR $1
            GROUP BY a.id, l.id
            "#,
            display_hidden
        )
            .fetch_all(&self.db)
            .await?
            .into_iter()
            .map(TryInto::try_into)
            .collect()
    }

    pub async fn update_activity(
        &self,
        id: &ActivityId,
        updated: ActivityContent<LocationId>,
    ) -> AppResult<Activity<Location>> {
        let mut tx = self.db.begin().await?;

        sqlx::query!(
            r#"
            UPDATE activity SET
                  location_id = $2,
                  name_nl = $3,
                  name_en = $4,
                  image = $5,
                  description_nl = $6,
                  description_en = $7,
                  registration_start = $8,
                  registration_end = $9,
                  registration_max = $10,
                  waiting_list_max = $11,
                  is_published = $12,
                  required_membership_status = $13::membership_status[],
                  activity_type = $14,
                  questions = $15,
                  metadata = $16,
                  updated = now()
            WHERE id = $1
            "#,
            **id,
            *updated.location,
            updated.name.nl,
            updated.name.en,
            updated.image.map(|id| *id),
            updated.description.as_ref().map(|l| l.nl.clone()),
            updated.description.map(|l| l.en),
            updated.registration_period.as_ref().map(|r| r.start),
            updated.registration_period.as_ref().map(|r| r.end),
            updated.registration_max,
            updated.waiting_list_max,
            updated.is_published,
            updated.required_membership_status as Vec<MembershipStatus>,
            Into::<&str>::into(updated.activity_type),
            serde_json::to_value(updated.questions)?,
            updated.metadata,
        )
        .execute(&mut *tx)
        .await?;

        sqlx::query!(
            r#"
            DELETE FROM date WHERE activity_id = $1
            "#,
            **id
        )
        .execute(&mut *tx)
        .await?;

        Self::add_dates_to_activity(&mut *tx, id, &updated.dates).await?;

        let activity = Self::get_activity(&mut *tx, id, true)
            .await
            .map_err(|err| Error::Internal(format!("{err:?}")))?;

        tx.commit().await?;

        Ok(activity)
    }

    async fn add_dates_to_activity<'c, E>(
        db: E,
        activity_id: &ActivityId,
        dates: &[Date],
    ) -> AppResult<()>
    where
        E: Executor<'c, Database = Postgres>,
    {
        let (start, end) =
            dates
                .iter()
                .fold((Vec::new(), Vec::new()), |(mut start, mut end), date| {
                    start.push(date.start);
                    end.push(date.end);
                    (start, end)
                });

        sqlx::query!(
            r#"
            INSERT INTO date (activity_id, start, "end") VALUES ($1, unnest($2::timestamptz[]), unnest($3::timestamptz[]))
            "#,
            **activity_id,
            &start,
            &end
        )
            .execute(db)
            .await?;
        Ok(())
    }

    pub async fn delete_activity(&self, id: &ActivityId) -> AppResult<()> {
        sqlx::query!(
            r#"
            DELETE FROM activity WHERE id = $1
            "#,
            **id
        )
        .execute(&self.db)
        .await?;
        Ok(())
    }

    /// Moves a registration from the waiting list to a regular registration
    /// and returns the old waiting list position (None if it wasn't on the waiting list)
    async fn remove_from_waiting_list(
        tx: &mut PgConnection,
        activity_id: &ActivityId,
        user_id: &UserId,
    ) -> AppResult<Option<i32>> {
        struct Position {
            pos: Option<i32>,
        }

        if let Position { pos: Some(pos) } = sqlx::query_as!(
            Position,
            r#"
            SELECT waiting_list_position as pos FROM activity_registration WHERE activity_id = $1 AND user_id = $2
            "#,
            **activity_id,
            **user_id
        ).fetch_one(&mut *tx).await? {
            sqlx::query!(
                r#"
                UPDATE activity_registration
                SET waiting_list_position = null
                WHERE activity_id = $1
                  AND user_id = $2
                "#,
                **activity_id,
                **user_id
            ).execute(&mut *tx).await?;

            sqlx::query!(
                r#"
                UPDATE activity_registration
                SET waiting_list_position = waiting_list_position - 1
                WHERE activity_id = $1
                  AND waiting_list_position > $2
                "#,
                **activity_id,
                pos
            ).execute(&mut *tx).await?;
            Ok(Some(pos))
        } else {
            Ok(None)
        }
    }

    async fn update_waiting_list_position(
        tx: &mut PgConnection,
        activity_id: &ActivityId,
        user_id: &UserId,
        new_waiting_list_pos: Option<i32>,
    ) -> AppResult<()> {
        struct Position {
            pos: Option<i32>,
        }

        let Position { pos } = sqlx::query_as!(
            Position,
            r#"
            SELECT waiting_list_position as pos FROM activity_registration WHERE activity_id = $1 AND user_id = $2
            "#,
            **activity_id,
            **user_id
        ).fetch_one(&mut *tx).await?;
        if pos == new_waiting_list_pos {
            return Ok(());
        }
        if new_waiting_list_pos.is_none() {
            Self::remove_from_waiting_list(tx, activity_id, user_id).await?;
            return Ok(());
        }

        struct Count {
            count: i64,
        }

        let Count {
            count: waiting_list_count,
        } = sqlx::query_as!(
            Count,
            r#"
            SELECT count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NOT NULL ) as "count!"
            FROM activity a
                LEFT JOIN activity_registration r ON r.activity_id = a.id
            WHERE a.id = $1
            GROUP BY a.id
            "#,
            **activity_id
        )
        .fetch_one(&mut *tx)
        .await?;

        if new_waiting_list_pos == Some((waiting_list_count - 1) as i32)
            || new_waiting_list_pos == Some(0)
        {
            Self::remove_from_waiting_list(tx, activity_id, user_id).await?;
            sqlx::query!(
                r#"
            UPDATE activity_registration
            SET waiting_list_position = $3,
                updated = now()
            WHERE activity_id = $1
              AND user_id = $2
            "#,
                **activity_id,
                **user_id,
                new_waiting_list_pos
            )
            .execute(&mut *tx)
            .await?;
        } else {
            Err(Error::BadRequest(
                "Cannot move to arbitrary position of waiting list.",
            ))?
        };

        Ok(())
    }

    pub async fn get_registered_users(&self, id: &ActivityId) -> AppResult<Vec<BasicUser>> {
        Ok(sqlx::query_as!(
            BasicUser,
            r#"
            SELECT u.id as user_id, u.first_name, u.infix, u.last_name
            FROM activity_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.activity_id = $1
            "#,
            **id
        )
        .fetch_all(&self.db)
        .await?)
    }

    pub async fn get_registrations_detailed(
        &self,
        id: &ActivityId,
    ) -> AppResult<Vec<Registration>> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT user_id,
                   u.first_name,
                   u.infix,
                   u.last_name,
                   answers,
                   attended,
                   waiting_list_position,
                   u.created,
                   u.updated
            FROM activity_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.activity_id = $1
            "#,
            **id
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(TryInto::try_into)
        .collect::<Result<Vec<Registration>, Error>>()
    }

    pub async fn get_registration(
        &self,
        activity_id: &ActivityId,
        user_id: &UserId,
    ) -> AppResult<Registration> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT user_id,
                   u.first_name,
                   u.infix,
                   u.last_name,
                   answers,
                   attended,
                   waiting_list_position,
                   u.created,
                   u.updated
            FROM activity_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.activity_id = $1
              AND user_id = $2
            "#,
            **activity_id,
            **user_id
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn new_registration(
        &self,
        activity_id: &ActivityId,
        user_id: &UserId,
        new: NewRegistration,
    ) -> AppResult<Registration> {
        sqlx::query!(
            r#"
            INSERT INTO activity_registration (activity_id, user_id, waiting_list_position, answers, created, updated)
            VALUES ($1, $2, $3, $4, now(), now())
            "#,
            **activity_id,
            **user_id,
            new.waiting_list_position,
            serde_json::to_value(new.answers)?
        )
            .execute(&self.db)
            .await?;
        self.get_registration(activity_id, user_id).await
    }

    pub async fn update_registration(
        &self,
        activity_id: &ActivityId,
        user_id: &UserId,
        updated: NewRegistration,
    ) -> AppResult<Registration> {
        let mut tx = self.db.begin().await?;
        sqlx::query!(
            r#"
            UPDATE activity_registration
            SET answers = $1,
                attended = $2,
                updated = now()
            WHERE activity_id = $3
              AND user_id = $4
            "#,
            serde_json::to_value(updated.answers)?,
            updated.attended,
            **activity_id,
            **user_id
        )
        .execute(&mut *tx)
        .await?;

        Self::update_waiting_list_position(
            &mut tx,
            activity_id,
            user_id,
            updated.waiting_list_position,
        )
        .await?;

        tx.commit().await?;

        self.get_registration(activity_id, user_id).await
    }

    pub async fn delete_registration(
        &self,
        activity_id: &ActivityId,
        user_id: &UserId,
    ) -> AppResult<()> {
        let mut tx = self.db.begin().await?;

        if Self::remove_from_waiting_list(&mut tx, activity_id, user_id)
            .await?
            .is_none()
        {
            sqlx::query!(
                r#"
                UPDATE activity_registration
                SET waiting_list_position = null
                WHERE activity_id = $1
                  AND waiting_list_position = 0
                "#,
                **activity_id
            )
            .execute(&mut *tx)
            .await?;

            sqlx::query!(
                r#"
                UPDATE activity_registration
                SET waiting_list_position = waiting_list_position - 1
                WHERE activity_id = $1
                "#,
                **activity_id
            )
            .execute(&mut *tx)
            .await?;
        }

        sqlx::query!(
            r#"
            DELETE FROM activity_registration WHERE activity_id = $1 and user_id = $2
            "#,
            **activity_id,
            **user_id,
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(())
    }
}
