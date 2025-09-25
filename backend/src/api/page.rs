use crate::page::PageContent;
use crate::{
    ValidatedJson,
    api::ApiResult,
    auth::{role::Role, session::Session},
    data_source::PageStore,
    error::{AppResult, Error},
    page::Page,
};
use axum::{Json, extract::Path};
use std::ops::Deref;
use uuid::Uuid;

fn update_access(session: &Session) -> AppResult<()> {
    if session.membership_status().is_member()
        && session.roles().iter().any(|role| {
            matches!(
                role,
                Role::Admin
                    | Role::Treasurer
                    | Role::Secretary
                    | Role::Chair
                    | Role::ViceChair
                    | Role::ClimbingCommissar
                    | Role::ActivityCommissionMember
            )
        })
    {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn read_access(page: &Page, session: &Session) -> AppResult<()> {
    if page.content.is_public || update_access(session).is_ok() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_page_content(
    store: PageStore,
    Path(slug): Path<String>,
    session: Session,
) -> ApiResult<Page> {
    let page = store.get_page(&slug).await?;
    read_access(&page, &session)?;
    // Currently Session does not work correctly, so if not logged in its unauthorized.

    Ok(Json(page))
}

pub async fn create_page(
    store: PageStore,
    Path(slug): Path<String>,
    session: Session,
    ValidatedJson(new): ValidatedJson<PageContent>,
) -> ApiResult<Page> {
    update_access(&session)?;
    let user: Uuid = *session.user_id().deref();

    Ok(Json(store.create_page(new, &slug, user).await?))
}

pub async fn update_page(
    store: PageStore,
    session: Session,
    Path(slug): Path<String>,
    ValidatedJson(updated): ValidatedJson<PageContent>,
) -> ApiResult<Page> {
    update_access(&session)?;

    Ok(Json(store.update_page(updated, &slug).await?))
}
