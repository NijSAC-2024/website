mod activity;
mod file;
mod material;
mod user;

pub use activity::*;
pub use file::*;
pub use material::*;
pub use user::*;

use crate::error::Error;
use axum::{
    extract::{
        rejection::{JsonRejection, QueryRejection},
        FromRequest, FromRequestParts, Query, Request,
    },
    http::request::Parts,
    Json,
};
use serde::{de::DeserializeOwned, Deserialize};
use validator::Validate;

type ApiResult<T> = Result<Json<T>, Error>;

#[derive(Deserialize, Debug, Validate)]
pub struct Pagination {
    #[serde(default = "get_50")]
    #[validate(range(min = 1, max = 50))]
    pub limit: i64,
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
