use crate::{
    ValidatedJson,
    api::{ApiResult, conditional_json_response, is_admin_or_board},
    auth::session::Session,
    data_source::PageStore,
    error::AppResult,
    page::{Page, PageContent},
};
use axum::{Json, extract::Path, http::HeaderMap, response::Response};
use uuid::Uuid;

fn include_private_for_session(session: Option<&Session>) -> bool {
    session.is_some_and(|s| s.is_member())
}

pub async fn get_pages(
    store: PageStore,
    session: Option<Session>,
    headers: HeaderMap,
) -> AppResult<Response> {
    let pages = store.get_all(include_private_for_session(session.as_ref())).await?;
    conditional_json_response(&headers, HeaderMap::new(), &pages)
}

pub async fn get_page_by_slug(
    store: PageStore,
    Path(slug): Path<String>,
    session: Option<Session>,
) -> ApiResult<Page> {
    Ok(Json(
        store
            .get_by_slug(&slug, include_private_for_session(session.as_ref()))
            .await?,
    ))
}

pub async fn create_page(
    store: PageStore,
    session: Session,
    ValidatedJson(content): ValidatedJson<PageContent>,
) -> ApiResult<Page> {
    is_admin_or_board(&session)?;
    Ok(Json(store.create(content, session.user_id()).await?))
}

pub async fn update_page(
    store: PageStore,
    session: Session,
    Path(page_id): Path<Uuid>,
    ValidatedJson(content): ValidatedJson<PageContent>,
) -> ApiResult<Page> {
    is_admin_or_board(&session)?;
    Ok(Json(store.update(&page_id.into(), content).await?))
}

pub async fn delete_page(
    store: PageStore,
    session: Session,
    Path(page_id): Path<Uuid>,
) -> AppResult<()> {
    is_admin_or_board(&session)?;
    store.delete(&page_id.into()).await
}
