use crate::{
    AppState, Language,
    error::Error,
    wire::event::{Event, EventContent, EventId},
};

use crate::{
    auth::role::MembershipStatus,
    error::AppResult,
    event::{Date, NewRegistration, Registration, RegistrationId},
    location::{Location, LocationContent, LocationId},
    user::{BasicUser, UserId},
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::{PgConnection, PgPool};
use time::OffsetDateTime;
use tracing::error;
use uuid::Uuid;
use validator::Validate;

pub struct EventStore {
    db: PgPool,
}

impl FromRequestParts<AppState> for EventStore {
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
struct PgEvent {
    id: Uuid,
    location_id: Uuid,
    location_name_en: String,
    location_name_nl: String,
    location_reusable: bool,
    location_description_nl: String,
    location_description_en: String,
    location_created: OffsetDateTime,
    location_updated: OffsetDateTime,
    name_nl: String,
    name_en: String,
    image: Option<Uuid>,
    description_nl: String,
    description_en: String,
    start_dates: Vec<OffsetDateTime>,
    end_dates: Vec<OffsetDateTime>,
    registration_start: Option<OffsetDateTime>,
    registration_end: Option<OffsetDateTime>,
    registration_max: Option<i32>,
    waiting_list_max: Option<i32>,
    is_published: bool,
    required_membership_status: Vec<MembershipStatus>,
    event_type: String,
    questions: serde_json::Value,
    metadata: serde_json::Value,
    registration_count: i64,
    waiting_list_count: i64,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgEvent> for Location {
    type Error = Error;

    fn try_from(pg: PgEvent) -> Result<Self, Self::Error> {
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
                description: Language {
                    en: pg.location_description_en,
                    nl: pg.location_description_nl,
                },
            },
        })
    }
}

impl TryFrom<PgEvent> for LocationId {
    type Error = Error;

    fn try_from(pg: PgEvent) -> Result<Self, Self::Error> {
        Ok(pg.location_id.into())
    }
}

impl<T> TryFrom<PgEvent> for Event<T>
where
    T: TryFrom<PgEvent, Error = Error>,
    T: Validate,
{
    type Error = Error;

    fn try_from(pg: PgEvent) -> Result<Self, Self::Error> {
        let location = TryFrom::try_from(pg.clone())?;

        let dates = pg
            .start_dates
            .into_iter()
            .zip(pg.end_dates)
            .map(|(start, end)| Date { start, end })
            .collect();

        Ok(Self {
            id: pg.id.into(),
            created: pg.created,
            updated: pg.updated,
            registration_count: pg.registration_count,
            waiting_list_count: pg.waiting_list_count,
            content: EventContent {
                name: Language {
                    en: pg.name_en,
                    nl: pg.name_nl,
                },
                image: pg.image.map(Into::into),
                description: Language {
                    en: pg.description_en,
                    nl: pg.description_nl,
                },
                registration_period: pg.registration_start.map(|start| Date { start, end: pg.registration_end.expect("If a registration start exists in the DB, there must also be an registration end") }),
                registration_max: pg.registration_max,
                waiting_list_max: pg.waiting_list_max,
                is_published: pg.is_published,
                required_membership_status: pg.required_membership_status,
                event_type: pg.event_type.parse()?,
                dates,
                questions: serde_json::from_value(pg.questions)?,
                metadata: pg.metadata,
                location,
            },
        })
    }
}

struct PgRegistration {
    registration_id: Uuid,
    event_id: EventId,
    user_id: Option<Uuid>,
    first_name: Option<String>,
    infix: Option<String>,
    last_name: Option<String>,
    attended: Option<bool>,
    waiting_list_position: Option<i32>,
    answers: serde_json::Value,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgRegistration> for Registration {
    type Error = Error;

    fn try_from(pg: PgRegistration) -> AppResult<Self> {
        let user = if let Some(user_id) = pg.user_id {
            Some(BasicUser {
                user_id: user_id.into(),
                first_name: pg.first_name.unwrap_or_default(),
                infix: pg.infix,
                last_name: pg.last_name.unwrap_or_default(),
            })
        } else {
            None
        };
        Ok(Self {
            registration_id: pg.registration_id.into(),
            event_id: pg.event_id,
            user,
            attended: pg.attended,
            waiting_list_position: pg.waiting_list_position,
            answers: serde_json::from_value(pg.answers)?,
            created: pg.created,
            updated: pg.updated,
        })
    }
}

impl EventStore {
    pub async fn new_event(
        &self,
        mut event: EventContent<LocationId>,
        created_by: &UserId,
    ) -> AppResult<Event<Location>> {
        let event_id = Uuid::now_v7();

        event.dates.sort_by_key(|date| date.start);
        let (start_dates, end_dates) = event.dates.into_iter().fold(
            (Vec::new(), Vec::new()),
            |(mut start_dates, mut end_dates), date| {
                start_dates.push(date.start);
                end_dates.push(date.end);
                (start_dates, end_dates)
            },
        );

        sqlx::query!(
            r#"
            INSERT INTO event (
                               id,
                               location_id,
                               name_nl,
                               name_en,
                               image,
                               start_dates,
                               end_dates,
                               description_nl,
                               description_en,
                               registration_start,
                               registration_end,
                               registration_max,
                               waiting_list_max,
                               is_published,
                               required_membership_status,
                               event_type,
                               questions,
                               metadata,
                               created_by,
                               created,
                               updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::membership_status[], $16, $17, $18, $19, now(), now())
            "#,
            event_id,
            *event.location,
            event.name.nl,
            event.name.en,
            event.image.map(|id|*id),
            &start_dates,
            &end_dates,
            event.description.nl,
            event.description.en,
            event.registration_period.as_ref().map(|r| r.start),
            event.registration_period.as_ref().map(|r| r.end),
            event.registration_max,
            event.waiting_list_max,
            event.is_published,
            event.required_membership_status as Vec<MembershipStatus>,
            Into::<&str>::into(event.event_type),
            serde_json::to_value(event.questions)?,
            event.metadata,
            **created_by
        ).execute(&self.db).await?;

        let event = self.get_event(&event_id.into(), true).await?;

        Ok(event)
    }

    pub async fn get_event(
        &self,
        id: &EventId,
        display_hidden: bool,
    ) -> AppResult<Event<Location>> {
        sqlx::query_as!(
            PgEvent,
            r#"
            SELECT e.id,
                   l.id as location_id,
                   l.name_en as location_name_en,
                   l.name_nl as location_name_nl,
                   l.description_nl as location_description_nl,
                   l.description_en as location_description_en,
                   l.reusable as location_reusable,
                   l.created as location_created,
                   l.updated as location_updated,
                   e.name_nl,
                   e.name_en,
                   e.image,
                   e.description_nl,
                   e.description_en,
                   e.start_dates,
                   e.end_dates,
                   e.registration_start,
                   e.registration_end,
                   e.registration_max,
                   e.waiting_list_max,
                   e.is_published,
                   e.required_membership_status as "required_membership_status:Vec<MembershipStatus>",
                   e.event_type,
                   e.questions,
                   e.metadata,
                   count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NULL ) as "registration_count!",
                   count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NOT NULL ) as "waiting_list_count!",
                   e.created,
                   e.updated
            FROM event e
                JOIN location l ON e.location_id = l.id
                LEFT JOIN event_registration r ON r.event_id = e.id
            WHERE e.id = $1 AND
                  (e.is_published OR $2)
            GROUP BY e.id, l.id
            "#,
            **id,
            display_hidden
        )
            .fetch_one(&self.db)
            .await?
            .try_into()
    }

    // TODO filter for events in the past
    pub async fn get_events(&self, display_hidden: bool) -> AppResult<Vec<Event<Location>>> {
        sqlx::query_as!(
            PgEvent,
            r#"
            SELECT e.id,
                   l.id as location_id,
                   l.name_en as location_name_en,
                   l.name_nl as location_name_nl,
                   l.description_nl as location_description_nl,
                   l.description_en as location_description_en,
                   l.reusable as location_reusable,
                   l.created as location_created,
                   l.updated as location_updated,
                   e.name_nl,
                   e.name_en,
                   e.image,
                   e.description_nl,
                   e.description_en,
                   e.start_dates,
                   e.end_dates,
                   e.registration_start,
                   e.registration_end,
                   e.registration_max,
                   e.waiting_list_max,
                   e.is_published,
                   e.required_membership_status as "required_membership_status:Vec<MembershipStatus>",
                   e.event_type,
                   e.questions,
                   e.metadata,
                   count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NULL ) as "registration_count!",
                   count(r.user_id) FILTER ( WHERE r.waiting_list_position IS NOT NULL ) as "waiting_list_count!",
                   e.created,
                   e.updated
            FROM event e
                JOIN location l ON e.location_id = l.id
                LEFT JOIN event_registration r ON r.event_id = e.id
            WHERE e.is_published OR $1
            GROUP BY e.id, l.id
            ORDER BY start_dates[1]
            "#,
            display_hidden
        )
            .fetch_all(&self.db)
            .await?
            .into_iter()
            .map(TryInto::try_into)
            .collect()
    }

    pub async fn update_event(
        &self,
        id: &EventId,
        mut updated: EventContent<LocationId>,
    ) -> AppResult<Event<Location>> {
        updated.dates.sort_by_key(|date| date.start);
        let (start_dates, end_dates) = updated.dates.into_iter().fold(
            (Vec::new(), Vec::new()),
            |(mut start_dates, mut end_dates), date| {
                start_dates.push(date.start);
                end_dates.push(date.end);
                (start_dates, end_dates)
            },
        );

        sqlx::query!(
            r#"
            UPDATE event SET
                  location_id = $2,
                  name_nl = $3,
                  name_en = $4,
                  image = $5,
                  start_dates = $6,
                  end_dates = $7,
                  description_nl = $8,
                  description_en = $9,
                  registration_start = $10,
                  registration_end = $11,
                  registration_max = $12,
                  waiting_list_max = $13,
                  is_published = $14,
                  required_membership_status = $15::membership_status[],
                  event_type = $16,
                  questions = $17,
                  metadata = $18,
                  updated = now()
            WHERE id = $1
            "#,
            **id,
            *updated.location,
            updated.name.nl,
            updated.name.en,
            updated.image.map(|id| *id),
            &start_dates,
            &end_dates,
            updated.description.nl,
            updated.description.en,
            updated.registration_period.as_ref().map(|r| r.start),
            updated.registration_period.as_ref().map(|r| r.end),
            updated.registration_max,
            updated.waiting_list_max,
            updated.is_published,
            updated.required_membership_status as Vec<MembershipStatus>,
            Into::<&str>::into(updated.event_type),
            serde_json::to_value(updated.questions)?,
            updated.metadata,
        )
        .execute(&self.db)
        .await?;

        let event = self.get_event(id, true).await?;

        Ok(event)
    }

    pub async fn delete_event(&self, id: &EventId) -> AppResult<()> {
        sqlx::query!(
            r#"
            DELETE FROM event WHERE id = $1
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
        registration_id: &RegistrationId,
    ) -> AppResult<Option<i32>> {
        struct Position {
            pos: Option<i32>,
        }

        if let Position { pos: Some(pos) } = sqlx::query_as!(
            Position,
            r#"
            SELECT waiting_list_position as pos FROM event_registration WHERE registration_id = $1
            "#,
            **registration_id,
        )
        .fetch_one(&mut *tx)
        .await?
        {
            sqlx::query!(
                r#"
                UPDATE event_registration
                SET waiting_list_position = null
                WHERE registration_id = $1
                "#,
                **registration_id,
            )
            .execute(&mut *tx)
            .await?;

            sqlx::query!(
                r#"
                UPDATE event_registration
                SET waiting_list_position = waiting_list_position - 1
                WHERE event_id = (SELECT event_id FROM event_registration WHERE registration_id = $1)
                  AND waiting_list_position > $2
                "#,
                **registration_id,
                pos
            ).execute(&mut *tx).await?;
            Ok(Some(pos))
        } else {
            Ok(None)
        }
    }

    async fn update_waiting_list_position(
        tx: &mut PgConnection,
        registration_id: &RegistrationId,
        new_waiting_list_pos: Option<i32>,
    ) -> AppResult<()> {
        struct Position {
            pos: Option<i32>,
        }

        let Position { pos } = sqlx::query_as!(
            Position,
            r#"
            SELECT waiting_list_position as pos FROM event_registration WHERE registration_id = $1
            "#,
            **registration_id,
        )
        .fetch_one(&mut *tx)
        .await?;
        if pos == new_waiting_list_pos {
            return Ok(());
        }
        if new_waiting_list_pos.is_none() {
            Self::remove_from_waiting_list(tx, registration_id).await?;
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
            FROM event e
                LEFT JOIN event_registration r ON r.event_id = e.id
            WHERE e.id = (SELECT event_id FROM event_registration WHERE registration_id = $1)
            GROUP BY e.id
            "#,
            **registration_id
        )
        .fetch_one(&mut *tx)
        .await?;

        if new_waiting_list_pos == Some((waiting_list_count - 1) as i32)
            || new_waiting_list_pos == Some(0)
        {
            Self::remove_from_waiting_list(tx, registration_id).await?;
            sqlx::query!(
                r#"
                UPDATE event_registration
                SET waiting_list_position = $2,
                    updated = now()
                WHERE registration_id = $1
                "#,
                **registration_id,
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

    pub async fn get_registered_users(&self, id: &EventId) -> AppResult<Vec<BasicUser>> {
        Ok(sqlx::query_as!(
            BasicUser,
            r#"
            SELECT u.id as user_id, u.first_name, u.infix, u.last_name
            FROM event_registration ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.event_id = $1
            "#,
            **id
        )
        .fetch_all(&self.db)
        .await?)
    }

    pub async fn get_user_registrations(&self, user_id: &UserId) -> AppResult<Vec<Registration>> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT registration_id,
                   event_id,
                   user_id,
                   u.first_name,
                   u.infix,
                   u.last_name,
                   answers,
                   attended,
                   waiting_list_position,
                   u.created,
                   u.updated
            FROM event_registration r
                JOIN "user" u ON r.user_id = u.id
            WHERE user_id = $1
            "#,
            **user_id
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(TryInto::try_into)
        .collect::<Result<Vec<Registration>, Error>>()
    }

    pub async fn get_registrations_detailed(&self, id: &EventId) -> AppResult<Vec<Registration>> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT registration_id,
                   event_id,
                   user_id,
                   u.first_name,
                   u.infix,
                   u.last_name,
                   answers,
                   attended,
                   waiting_list_position,
                   u.created,
                   u.updated
            FROM event_registration r
                JOIN "user" u ON r.user_id = u.id
            WHERE r.event_id = $1
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
        registration_id: &RegistrationId,
    ) -> AppResult<Registration> {
        sqlx::query_as!(
            PgRegistration,
            r#"
            SELECT registration_id,
                   event_id,
                   user_id,
                   -- the `first_name` and `last_name` must be explicitly marked optional
                   -- due to the LEFT JOIN, as otherwise sqlx infers that they are NOT NULL from
                   -- the schema
                   u.first_name as "first_name?",
                   u.infix,
                   u.last_name as "last_name?",
                   answers,
                   attended,
                   waiting_list_position,
                   r.created,
                   r.updated
            FROM event_registration r
                LEFT JOIN "user" u ON r.user_id = u.id
            WHERE registration_id = $1
            "#,
            **registration_id,
        )
        .fetch_one(&self.db)
        .await
        .inspect_err(|err| error!("{err}"))?
        .try_into()
    }

    pub async fn new_registration(
        &self,
        event_id: &EventId,
        user_id: Option<UserId>,
        new: NewRegistration,
    ) -> AppResult<Registration> {
        let registration_id = sqlx::query_scalar!(
            r#"
            INSERT INTO event_registration (registration_id, event_id, user_id, waiting_list_position, answers, created, updated)
            VALUES  ($1, $2, $3, $4, $5, now(), now())
            RETURNING registration_id
            "#,
            Uuid::now_v7(),
            **event_id,
            user_id.map(|u| *u),
            new.waiting_list_position,
            serde_json::to_value(new.answers)?
        )
            .fetch_one(&self.db)
            .await?;
        self.get_registration(&registration_id.into()).await
    }

    pub async fn update_registration(
        &self,
        registration_id: &RegistrationId,
        updated: NewRegistration,
    ) -> AppResult<Registration> {
        let mut tx = self.db.begin().await?;
        sqlx::query!(
            r#"
            UPDATE event_registration
            SET answers = $1,
                attended = $2,
                updated = now()
            WHERE registration_id = $3
            "#,
            serde_json::to_value(updated.answers)?,
            updated.attended,
            **registration_id,
        )
        .execute(&mut *tx)
        .await?;

        Self::update_waiting_list_position(&mut tx, registration_id, updated.waiting_list_position)
            .await?;

        tx.commit().await?;

        self.get_registration(registration_id).await
    }

    pub async fn delete_registration(&self, registration_id: &RegistrationId) -> AppResult<()> {
        let mut tx = self.db.begin().await?;

        if Self::remove_from_waiting_list(&mut tx, registration_id)
            .await?
            .is_none()
        {
            let event_id = sqlx::query_scalar!(
                r#"SELECT event_id FROM event_registration WHERE registration_id = $1"#,
                **registration_id,
            )
            .fetch_one(&mut *tx)
            .await?;

            sqlx::query!(
                r#"
                UPDATE event_registration
                SET waiting_list_position = null
                WHERE event_id = $1
                  AND waiting_list_position = 0
                "#,
                event_id
            )
            .execute(&mut *tx)
            .await?;

            sqlx::query!(
                r#"
                UPDATE event_registration
                SET waiting_list_position = waiting_list_position - 1
                WHERE event_id = $1
                "#,
                event_id
            )
            .execute(&mut *tx)
            .await?;
        }

        sqlx::query!(
            r#"
            DELETE FROM event_registration WHERE registration_id = $1
            "#,
            **registration_id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(())
    }
}
