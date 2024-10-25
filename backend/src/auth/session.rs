use crate::auth::role::{MembershipStatus, Roles};
use crate::auth::COOKIE_NAME;
use crate::error::{AppResult, Error};
use crate::wire::user::UserCredentials;
use crate::AppState;
use argon2::{password_hash, Argon2, PasswordHash, PasswordVerifier};
use axum::async_trait;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum_extra::extract::cookie::Cookie;
use axum_extra::extract::CookieJar;
use rand::distributions::{Alphanumeric, DistString};
use serde::Serialize;
use sqlx::PgPool;
use time::OffsetDateTime;
use tracing::trace;
use uuid::Uuid;

#[derive(Serialize)]
pub(super) struct Session {
    user_id: Uuid,
    #[serde(skip)]
    cookie_value: String,
    roles: Roles,
    membership_status: MembershipStatus,
    #[serde(skip)]
    expiration: OffsetDateTime,
}

struct PgSession {
    user_id: Uuid,
    cookie_value: String,
    roles: serde_json::Value,
    status: MembershipStatus,
    expiration: OffsetDateTime,
}

impl TryFrom<PgSession> for Session {
    type Error = Error;

    fn try_from(pg: PgSession) -> Result<Self, Self::Error> {
        Ok(Self {
            user_id: pg.user_id,
            cookie_value: pg.cookie_value,
            roles: serde_json::from_value(pg.roles)?,
            membership_status: pg.status,
            expiration: pg.expiration,
        })
    }
}

struct PwHash {
    id: Uuid,
    pw_hash: Option<String>,
}

impl Session {
    pub fn into_cookie(self) -> Cookie<'static> {
        Cookie::build((COOKIE_NAME, self.cookie_value))
            .secure(true)
            .path("/")
            .expires(Some(self.expiration))
            .build()
    }

    async fn get(cookie_value: &str, db: &PgPool) -> AppResult<Session> {
        let session = match sqlx::query_as!(
            PgSession,
            r#"
            SELECT cookie_value,
                   u.id AS user_id,
                   roles,
                   status AS "status: MembershipStatus",
                   expiration
            FROM session
                JOIN "user" u ON user_id = u.id
            WHERE expiration > now()
                AND cookie_value = $1
            "#,
            cookie_value
        )
        .fetch_one(db)
        .await
        {
            Ok(s) => Ok(s),
            Err(sqlx::Error::RowNotFound) => Err(Error::Unauthorized),
            Err(err) => Err(err.into()),
        }?;

        session.try_into()
    }

    pub async fn new(credentials: UserCredentials, db: &PgPool) -> AppResult<Session> {
        let PwHash { id, pw_hash } = match sqlx::query_as!(
            PwHash,
            r#"
            SELECT id, pw_hash
            FROM "user"
            WHERE email = $1
            "#,
            credentials.email
        )
        .fetch_one(db)
        .await
        {
            Ok(user) => Ok(user),
            Err(sqlx::Error::RowNotFound) => Err(Error::Unauthorized),
            Err(err) => Err(err.into()),
        }?;

        // If the user currently has no password set
        let pw_hash = pw_hash.ok_or(Error::Unauthorized)?;

        let parsed_hash = PasswordHash::new(&pw_hash).map_err(Error::Argon2)?;
        Argon2::default()
            .verify_password(credentials.password.as_bytes(), &parsed_hash)
            .map_err(|err| match err {
                password_hash::Error::Password => Error::Unauthorized,
                _ => Error::Argon2(err),
            })?;

        let cookie_value = Alphanumeric.sample_string(&mut rand::thread_rng(), 32);

        let session = sqlx::query_as!(
            PgSession,
            r#"
            WITH new_session AS (
                INSERT INTO session 
                    (
                     cookie_value,
                     user_id,
                     expiration
                ) VALUES ($1, $2, now() + '1 month')
                RETURNING *)
            SELECT cookie_value,
                   u.id AS user_id,
                   roles,
                   status AS "status: MembershipStatus",
                   expiration
            FROM new_session 
                JOIN "user" u ON user_id = u.id
                     
            "#,
            cookie_value,
            id,
        )
        .fetch_one(db)
        .await?
        .try_into()?;

        trace!("Created new session for user {}", credentials.email);

        Ok(session)
    }
}

#[async_trait]
impl FromRequestParts<AppState> for Session {
    type Rejection = Error;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let jar = CookieJar::from_request_parts(parts, state)
            .await
            .map_err(|_| Self::Rejection::BadRequest("Cannot decode cookies"))?;

        let session_cookie = jar
            .get(COOKIE_NAME)
            .ok_or(Self::Rejection::Unauthorized)?
            .value();

        Session::get(session_cookie, state.pool()).await
    }
}
