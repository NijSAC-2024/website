use crate::{
    auth::role::MembershipStatus,
    data_source::Count,
    error::{AppResult, Error},
    wire::user::{User, UserContent, UserId},
    AppState, Pagination,
};
use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use sqlx::PgPool;
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;

pub(crate) struct UserStore {
    db: PgPool,
}

#[async_trait]
impl FromRequestParts<AppState> for UserStore {
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
struct PgUser {
    id: Uuid,
    first_name: String,
    last_name: String,
    phone: String,
    student_number: Option<i32>,
    nkbv_number: Option<i32>,
    sportcard_number: Option<i32>,
    ice_contact_name: Option<String>,
    ice_contact_email: Option<String>,
    ice_contact_phone: Option<String>,
    important_info: Option<String>,
    roles: serde_json::Value,
    status: MembershipStatus,
    email: String,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgUser> for User {
    type Error = Error;

    fn try_from(pg: PgUser) -> Result<Self, Self::Error> {
        Ok(Self {
            id: pg.id.into(),
            created: pg.created,
            updated: pg.updated,
            content: UserContent {
                first_name: pg.first_name,
                last_name: pg.last_name,
                roles: serde_json::from_value(pg.roles)?,
                status: pg.status,
                email: pg.email,
                phone: pg.phone,
                student_number: pg.student_number,
                nkbv_number: pg.nkbv_number,
                sportcard_number: pg.sportcard_number,
                ice_contact_name: pg.ice_contact_name,
                ice_contact_email: pg.ice_contact_email,
                ice_contact_phone: pg.ice_contact_phone,
                important_info: pg.important_info,
            },
        })
    }
}

impl UserStore {
    pub async fn count(&self) -> AppResult<Count> {
        let count = sqlx::query_as!(
            Count,
            r#"
            SELECT COUNT(*) AS "count!" FROM "user"
            "#
        )
        .fetch_one(&self.db)
        .await?;
        Ok(count)
    }

    pub async fn create(&self, new: &UserContent) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            INSERT INTO "user"
            (id,
             first_name,
             last_name,
             phone,
             student_number,
             nkbv_number,
             sportcard_number,
             ice_contact_name,
             ice_contact_email,
             ice_contact_phone,
             important_info,
             roles,
             status,
             email,
             created,
             updated)
            VALUES ($1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13::membership_status,
                    $14,
                    now(),
                    now())
            RETURNING
                id,
                first_name,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            Uuid::now_v7(),
            new.first_name,
            new.last_name,
            new.phone,
            new.student_number,
            new.nkbv_number,
            new.sportcard_number,
            new.ice_contact_name,
            new.ice_contact_email,
            new.ice_contact_phone,
            new.important_info,
            serde_json::to_value(&new.roles)?,
            new.status as MembershipStatus,
            new.email,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get(&self, id: &UserId) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            SELECT 
                id,
                first_name,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            FROM "user" WHERE id = $1
            "#,
            id.deref()
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get_all(&self, pagination: &Pagination) -> AppResult<Vec<User>> {
        sqlx::query_as!(
            PgUser,
            r#"
            SELECT 
                id,
                first_name,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            FROM "user"
            ORDER BY last_name
            LIMIT $1
            OFFSET $2
            "#,
            pagination.limit,
            pagination.offset
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(TryInto::try_into)
        .collect()
    }

    pub async fn update(&self, id: &UserId, user: UserContent) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            UPDATE "user"
            SET first_name = $2,
                last_name = $3,
                phone = $4,
                student_number = $5,
                nkbv_number = $6,
                sportcard_number = $7,
                ice_contact_name = $8,
                ice_contact_email = $9,
                ice_contact_phone = $10,
                important_info = $11,
                roles = $12,
                status = $13,
                email = $14,
                updated = now()
            WHERE id = $1
            RETURNING
                id,
                first_name,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            id.deref(),
            user.first_name,
            user.last_name,
            user.phone,
            user.student_number,
            user.nkbv_number,
            user.sportcard_number,
            user.ice_contact_name,
            user.ice_contact_email,
            user.ice_contact_phone,
            user.important_info,
            serde_json::to_value(&user.roles)?,
            user.status as MembershipStatus,
            user.email,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn update_email(&self, id: &UserId, email: &str) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            UPDATE "user"
            SET email = $2,
                updated = now()
            WHERE id = $1
            RETURNING
                id,
                first_name,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            id.deref(),
            email,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn update_pwd(&self, id: &UserId, new_pw: Option<&str>) -> AppResult<()> {
        let pwd_hash = match new_pw {
            Some(pwd) => {
                let salt = SaltString::generate(&mut OsRng);
                let hash = Argon2::default()
                    .hash_password(pwd.as_bytes(), &salt)
                    .map_err(Error::Argon2)?
                    .to_string();
                Some(hash)
            }
            None => None,
        };

        sqlx::query!(
            r#"
            UPDATE "user" 
            SET pw_hash = $2,
                updated = now()
            WHERE id = $1
            "#,
            id.deref(),
            pwd_hash,
        )
        .execute(&self.db)
        .await?;

        Ok(())
    }
}
