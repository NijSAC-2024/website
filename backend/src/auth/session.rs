use crate::{
    auth::{
        role::{MembershipStatus, Roles},
        COOKIE_NAME,
    },
    error::{AppResult, Error},
    user::UserId,
    wire::user::UserCredentials,
    AppState,
};
use argon2::PasswordHash;
use axum::{
    extract::{FromRequestParts, OptionalFromRequestParts},
    http::request::Parts,
};
use axum_extra::extract::{cookie::Cookie, CookieJar};
use rand::distr::{Alphanumeric, SampleString};
use sqlx::PgPool;
use time::OffsetDateTime;
use tracing::trace;
use uuid::Uuid;

pub(crate) struct Session {
    user_id: UserId,
    cookie_value: String,
    roles: Roles,
    membership_status: MembershipStatus,
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
            user_id: pg.user_id.into(),
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
    pub fn roles(&self) -> &Roles {
        &self.roles
    }

    pub fn membership_status(&self) -> MembershipStatus {
        self.membership_status
    }

    pub fn user_id(&self) -> &UserId {
        &self.user_id
    }

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
        credentials.verify_pwd(&parsed_hash)?;

        let cookie_value = Alphanumeric.sample_string(&mut rand::rng(), 32);

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

    pub async fn delete(self, db: &PgPool) -> AppResult<()> {
        sqlx::query!(
            r#"
            DELETE FROM session WHERE cookie_value = $1
            "#,
            self.cookie_value
        )
        .execute(db)
        .await?;
        Ok(())
    }
}

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

impl OptionalFromRequestParts<AppState> for Session {
    type Rejection = Error;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Option<Self>, Self::Rejection> {
        let jar = CookieJar::from_request_parts(parts, state)
            .await
            .map_err(|_| Self::Rejection::BadRequest("Cannot decode cookies"))?;

        let session_cookie = match jar.get(COOKIE_NAME) {
            None => return Ok(None),
            Some(c) => c.value(),
        };

        Ok(Some(Session::get(session_cookie, state.pool()).await?))
    }
}
