use crate::{
    Pagination, ValidatedJson,
    api::{ApiResult, committee::active_committee_access, conditional_json_response},
    auth::{role::Role, session::Session},
    data_source::{LocationStore, committee::CommitteeStore},
    error::{AppResult, Error},
    location::{Location, LocationContent, LocationId, UsedBy},
};
use axum::{
    Json,
    extract::{Path, Query},
    http::HeaderMap,
    response::Response,
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

pub async fn get_location(store: LocationStore, Path(id): Path<LocationId>) -> ApiResult<Location> {
    Ok(Json(store.get_one(&id).await?))
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights,
/// the list contains non-reusable locations (if not manually filtered with query parameters).
pub async fn get_locations(
    store: LocationStore,
    Query(mut filter): Query<LocationFilter>,
    session: Option<Session>,
    headers: HeaderMap,
) -> AppResult<Response> {
    match session {
        None => filter.reusable = Some(true),
        Some(session) => {
            if update_access(&session).is_err() {
                filter.reusable = Some(true)
            }
        }
    }
    let total = store.count(&filter).await?;
    let response_headers = total.as_header();
    let locations = store.get_all(&filter).await?;
    conditional_json_response(&headers, response_headers, &locations)
}

pub async fn create_location(
    store: LocationStore,
    committee_store: CommitteeStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<LocationContent>,
) -> ApiResult<Location> {
    active_committee_access(&session, &committee_store).await?;

    Ok(Json(store.create(new).await?))
}

pub async fn update_location(
    store: LocationStore,
    session: Session,
    Path(id): Path<LocationId>,
    ValidatedJson(updated): ValidatedJson<LocationContent>,
) -> ApiResult<Location> {
    update_access(&session)?;

    Ok(Json(store.update(&id, updated).await?))
}

pub async fn delete_location(
    store: LocationStore,
    session: Session,
    Path(id): Path<LocationId>,
) -> AppResult<()> {
    update_access(&session)?;

    store.delete(&id).await
}

pub async fn location_used_by(
    store: LocationStore,
    session: Session,
    Path(id): Path<LocationId>,
) -> ApiResult<UsedBy> {
    update_access(&session)?;

    Ok(Json(store.used_by(&id).await?))
}
