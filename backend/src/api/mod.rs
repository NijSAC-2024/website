mod committee;
mod event;
mod file;
mod location;
mod material;
mod page;
mod user;

use crate::{
    auth::{role::Role, session::Session},
    error::{AppResult, Error},
};
use axum::{
    Json,
    extract::{
        FromRequest, FromRequestParts, Query, Request,
        rejection::{JsonRejection, QueryRejection},
    },
    http::request::Parts,
};
pub use committee::*;
pub use event::*;
pub use file::*;
pub use location::*;
pub use material::*;
pub use page::*;
use serde::{Deserialize, de::DeserializeOwned};
use serde_with::{DisplayFromStr, serde_as};
pub use user::*;
use validator::Validate;

type ApiResult<T> = Result<Json<T>, Error>;

#[serde_as]
#[derive(Deserialize, Debug, Validate)]
pub struct Pagination {
    #[serde_as(as = "DisplayFromStr")]
    #[serde(default = "get_50")]
    #[validate(range(min = 1, max = 50))]
    pub limit: i64,
    #[serde_as(as = "DisplayFromStr")]
    #[serde(default)]
    #[validate(range(min = 0))]
    pub offset: i64,
}

fn get_50() -> i64 {
    50
}

#[derive(Debug, Clone)]
pub struct ValidatedJson<T>(pub T);

#[derive(Debug, Clone)]
pub struct ValidatedQuery<T>(pub T);

impl<T, S> FromRequest<S> for ValidatedJson<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
    Json<T>: FromRequest<S, Rejection = JsonRejection>,
{
    type Rejection = Error;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value) = Json::<T>::from_request(req, state).await?;
        value.validate()?;
        Ok(ValidatedJson(value))
    }
}

impl<T, S> FromRequestParts<S> for ValidatedQuery<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
    Query<T>: FromRequestParts<S, Rejection = QueryRejection>,
{
    type Rejection = Error;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let Query(value) = Query::<T>::from_request_parts(parts, state).await?;
        value.validate()?;
        Ok(ValidatedQuery(value))
    }
}

pub(crate) fn is_admin_or_board(session: &Session) -> AppResult<()> {
    if session.roles().iter().any(|role| {
        matches!(
            role,
            Role::Admin
                | Role::Treasurer
                | Role::Secretary
                | Role::Chair
                | Role::ViceChair
                | Role::ClimbingCommissar
        )
    }) {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}
