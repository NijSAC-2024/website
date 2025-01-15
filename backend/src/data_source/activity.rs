use crate::{
    error::Error,
    wire::activity::{Activity, ActivityContent, ActivityId},
    AppState,
};

use crate::wire::activity::{Location, Registration};
use crate::{
    auth::role::MembershipStatus,
    user::BasicUser,
    wire::activity::{ActivityContentHydrated, ActivityType},
};
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
    location_name_en: String,
    location_name_nl: String,
    location_description_nl: Option<String>,
    location_description_en: Option<String>,
    name_nl: String,
    name_en: String,
    description_nl: Option<String>,
    description_en: Option<String>,
    start_time: OffsetDateTime,
    end_time: OffsetDateTime,
    registration_start: OffsetDateTime,
    registration_end: OffsetDateTime,
    registration_max: Option<i32>,
    waiting_list_max: Option<i32>,
    allow_guest_signup: bool,
    created_at: OffsetDateTime,
    updated_at: OffsetDateTime,
    is_hidden: bool,
    required_membership_status: Vec<MembershipStatus>,
    activity_type: ActivityType,
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
                name_nl: pg.name_nl,
                name_en: pg.name_en,
                description_nl: pg.description_nl,
                description_en: pg.description_en,
                start_time: pg.start_time,
                end_time: pg.end_time,
                registration_start: pg.registration_start,
                registration_end: pg.registration_end,
                registration_max: pg.registration_max,
                is_hidden: pg.is_hidden,
                required_membership_status: pg.required_membership_status,
                waiting_list_max: pg.waiting_list_max,
                activity_type: pg.activity_type,
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
                location: Location {
                    id: pg.location_id,
                    name_nl: pg.location_name_nl,
                    name_en: pg.location_name_en,
                    description_nl: pg.location_description_nl,
                    description_en: pg.location_description_en,
                },
                name_nl: pg.name_nl,
                name_en: pg.name_en,
                description_nl: pg.description_nl,
                description_en: pg.description_en,
                start_time: pg.start_time,
                end_time: pg.end_time,
                registration_start: pg.registration_start,
                registration_end: pg.registration_end,
                registration_max: pg.registration_max,
                waiting_list_max: pg.waiting_list_max,
                is_hidden: pg.is_hidden,
                required_membership_status: pg.required_membership_status,
                activity_type: pg.activity_type,
                registrations: vec![],
            },
        })
    }
}

struct PgRegistration {
    user_id: Uuid,
    first_name: String,
    last_name: String,
}

impl ActivityStore {
    pub async fn get_registrations(&self, id: ActivityId) -> Result<Vec<BasicUser>, Error> {
        let id_uuid: Uuid = id.into();

        let users = sqlx::query_as!(
            BasicUser,
            r#"
            SELECT u.id as "id: Uuid", u.first_name, u.last_name
            FROM activity_registrations ar
                JOIN "user" u ON ar.user_id = u.id
            WHERE ar.user_id = $1
            "#,
            id_uuid
        )
        .fetch_all(&self.db)
        .await?;
        
        
    }
}
