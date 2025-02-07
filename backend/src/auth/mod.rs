use crate::{
    api::ValidatedJson, auth::session::Session, error::Error, wire::user::UserCredentials,
};
use axum::response::IntoResponse;
use axum_extra::extract::{cookie::Cookie, CookieJar};
use sqlx::PgPool;
use tracing::trace;

pub mod role;
pub mod session;

const COOKIE_NAME: &str = "SESSION";

pub async fn login(
    db: PgPool,
    jar: CookieJar,
    ValidatedJson(credentials): ValidatedJson<UserCredentials>,
) -> Result<impl IntoResponse, Error> {
    trace!("Login attempt for user {}", credentials.email);
    let session = Session::new(credentials, &db).await?;
    Ok(jar.add(session.into_cookie()))
}

pub async fn logout(
    db: PgPool,
    session: Option<Session>,
    mut jar: CookieJar,
) -> Result<impl IntoResponse, Error> {
    jar = jar.remove(Cookie::from(COOKIE_NAME));
    if let Some(session) = session {
        session.delete(&db).await?;
    } 
    Ok(jar)
}
