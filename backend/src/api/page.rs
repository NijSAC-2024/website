use crate::{
    ValidatedJson,
    api::{ApiResult, IntoApiResult, conditional_json_response, is_admin_or_board},
    auth::session::Session,
    data_source::PageStore,
    page::{PageContent, PageId},
};
use axum::{extract::Path, http::HeaderMap};

fn include_private_for_session(session: Option<&Session>) -> bool {
    session.is_some_and(|s| s.is_member())
}

pub async fn get_pages(
    store: PageStore,
    session: Option<Session>,
    headers: HeaderMap,
) -> ApiResult {
    let pages = store
        .get_all(include_private_for_session(session.as_ref()))
        .await?;
    conditional_json_response(&headers, &pages)
}

pub async fn get_page_by_slug(
    store: PageStore,
    Path(slug): Path<String>,
    session: Option<Session>,
    headers: HeaderMap,
) -> ApiResult {
    let page = store
        .get_by_slug(&slug, include_private_for_session(session.as_ref()))
        .await?;
    conditional_json_response(&headers, &page)
}

pub async fn create_page(
    store: PageStore,
    session: Session,
    ValidatedJson(content): ValidatedJson<PageContent>,
) -> ApiResult {
    is_admin_or_board(&session)?;
    store.create(content, session.user_id()).await.into_api()
}

pub async fn update_page(
    store: PageStore,
    session: Session,
    Path(page_id): Path<PageId>,
    ValidatedJson(content): ValidatedJson<PageContent>,
) -> ApiResult {
    is_admin_or_board(&session)?;
    store.update(&page_id, content).await.into_api()
}

pub async fn delete_page(
    store: PageStore,
    session: Session,
    Path(page_id): Path<PageId>,
) -> ApiResult {
    is_admin_or_board(&session)?;
    store.delete(&page_id).await.into_api()
}
