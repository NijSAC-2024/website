use crate::{
    error::Error,
    wire::activity::{Activity, ActivityContent, ActivityId},
    AppState,
};
use std::ops::Deref;

use crate::{user::BasicUser, wire::activity::ActivityContentHydrated};
use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

pub(crate) struct ActivityStore {
    db: PgPool,
}

#[async_trait]
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

#[derive(Debug)]
struct PgActivity {
    id: Uuid,
    location_id: Uuid,
    name: String,
    description: Option<String>,
    start_time: OffsetDateTime,
    end_time: OffsetDateTime,
    registration_start: OffsetDateTime,
    registration_end: OffsetDateTime,
    allow_guest_signup: bool,
    created_at: OffsetDateTime,
    updated_at: OffsetDateTime,
    hidden: bool,
}

impl TryFrom<PgActivity> for Activity<ActivityContent> {
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        Ok(Self {
            id: pg.id.into(),
            created: pg.created_at,
            updated: pg.updated_at,
            content: ActivityContent {
                location_id: pg.location_id.into(),
                name: pg.name,
                description: pg.description,
                start_time: pg.start_time,
                end_time: pg.end_time,
                registration_start: pg.registration_start,
                registration_end: pg.registration_end,
                allow_guest_signup: pg.allow_guest_signup,
                is_hidden: pg.hidden,
            },
        })
    }
}

impl TryFrom<PgActivity> for Activity<ActivityContentHydrated> {
    type Error = Error;

    fn try_from(pg: PgActivity) -> Result<Self, Self::Error> {
        Ok(Self {
            id: pg.id.into(),
            created: pg.created_at,
            updated: pg.updated_at,
            content: ActivityContentHydrated {
                location_id: pg.location_id.into(),
                name: pg.name,
                description: pg.description,
                start_time: pg.start_time,
                end_time: pg.end_time,
                registration_start: pg.registration_start,
                registration_end: pg.registration_end,
                allow_guest_signup: pg.allow_guest_signup,
                is_hidden: pg.hidden,
                registrations: vec![],
            },
        })
    }
}

impl ActivityStore {
    pub async fn get_registrations(
        &self,
        activity_id: ActivityId,
    ) -> Result<Vec<BasicUser>, Error> {
        let activity_id_uuid: Uuid = activity_id.into();

        let users = sqlx::query_as!(
            BasicUser,
            r#"
            SELECT u.id as "id: Uuid", u.first_name, u.last_name
            FROM activity_user au
            JOIN "user" u ON au.user_id = u.id
            WHERE au.activity_id = $1
            "#,
            activity_id_uuid
        )
        .fetch_all(&self.db)
        .await?;

        Ok(users)
    }
}
