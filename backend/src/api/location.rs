use crate::{
    AppResult, Pagination, ValidatedJson,
    api::{
        ApiResult, IntoApiResult, committee::active_committee_access, conditional_json_response,
    },
    auth::{role::Role, session::Session},
    data_source::{LocationStore, committee::CommitteeStore},
    error::Error,
    location::{Location, LocationContent, LocationId},
};
use axum::{
    extract::{Path, Query},
    http::HeaderMap,
};
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct LocationFilter {
    pub reusable: Option<bool>,
    #[serde(flatten)]
    pub pagination: Pagination,
}

fn update_access(session: &Session) -> AppResult<()> {
    if session.is_member()
        && session.roles().iter().any(|role| {
            matches!(
                role,
                Role::Admin
                    | Role::Treasurer
                    | Role::Secretary
                    | Role::Chair
                    | Role::ViceChair
                    | Role::ClimbingCommissar
            )
        })
    {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_location(
    store: LocationStore,
    Path(id): Path<LocationId>,
    headers: HeaderMap,
) -> ApiResult {
    let location: Location = store.get_one(&id).await?;
    conditional_json_response(&headers, &location)
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights,
/// the list contains non-reusable locations (if not manually filtered with query parameters).
pub async fn get_locations(
    store: LocationStore,
    Query(mut filter): Query<LocationFilter>,
    session: Option<Session>,
    headers: HeaderMap,
) -> ApiResult {
    match session {
        None => filter.reusable = Some(true),
        Some(session) => {
            if update_access(&session).is_err() {
                filter.reusable = Some(true)
            }
        }
    }
    let locations = store.get_all(&filter).await?;
    conditional_json_response(&headers, &locations)
}

pub async fn create_location(
    store: LocationStore,
    committee_store: CommitteeStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<LocationContent>,
) -> ApiResult {
    active_committee_access(&session, &committee_store).await?;
    store.create(new).await.into_api()
}

pub async fn update_location(
    store: LocationStore,
    session: Session,
    Path(id): Path<LocationId>,
    ValidatedJson(updated): ValidatedJson<LocationContent>,
) -> ApiResult {
    update_access(&session)?;
    store.update(&id, updated).await.into_api()
}

pub async fn delete_location(
    store: LocationStore,
    session: Session,
    Path(id): Path<LocationId>,
) -> ApiResult {
    update_access(&session)?;
    store.delete(&id).await.into_api()
}

pub async fn location_used_by(
    store: LocationStore,
    session: Session,
    Path(id): Path<LocationId>,
) -> ApiResult {
    update_access(&session)?;
    store.used_by(&id).await.into_api()
}
