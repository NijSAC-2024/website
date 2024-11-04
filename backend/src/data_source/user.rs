use crate::auth::role::MembershipStatus;
use crate::data_source::Count;
use crate::error::{AppResult, Error};
use crate::wire::user::{User, UserContent, UserId};
use crate::{AppState, Pagination};
use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHasher};
use axum::async_trait;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
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
             roles,
             status,
             email,
             created,
             updated)
            VALUES ($1,
                    $2,
                    $3,
                    $4,
                    $5::membership_status,
                    $6,
                    now(),
                    now())
            RETURNING
                id,
                first_name,
                last_name,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            Uuid::now_v7(),
            new.first_name,
            new.last_name,
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
                roles = $4,
                status = $5,
                email = $6,
                updated = now()
            WHERE id = $1
            RETURNING
                id,
                first_name,
                last_name,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            id.deref(),
            user.first_name,
            user.last_name,
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
