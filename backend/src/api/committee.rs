use crate::{
    AppResult, ValidatedJson,
    api::{ApiResult, IntoApiResult, conditional_json_response, is_admin_or_board},
    auth::session::Session,
    committee::{Committee, CommitteeContent, CommitteeId, CommitteeRole, UserCommittee},
    data_source::committee::CommitteeStore,
    error::Error,
    user::UserId,
};
use axum::{extract::Path, http::HeaderMap};

pub async fn committee_access(
    session: &Session,
    committee_id: &CommitteeId,
    store: &CommitteeStore,
) -> AppResult<()> {
    // Admins and board members always allowed
    if is_admin_or_board(session).is_ok() {
        return Ok(());
    }

    let user_id = session.user_id().clone();
    let user_committees: Vec<UserCommittee> = store.get_committees_for_user(&user_id).await?;

    // Must be chair and currently active (left IS NONE)
    let is_chair = user_committees.iter().any(|c| {
        c.committee_id == *committee_id && c.role == CommitteeRole::Chair && c.left.is_none()
    });

    if is_chair {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn active_committee_access(session: &Session, store: &CommitteeStore) -> AppResult<()> {
    let user_committees: Vec<UserCommittee> =
        store.get_committees_for_user(session.user_id()).await?;

    let is_active_in_any_committee = user_committees.iter().any(|c| c.left.is_none());

    if is_active_in_any_committee || is_admin_or_board(session).is_ok() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_committee(
    store: CommitteeStore,
    Path(id): Path<CommitteeId>,
    headers: HeaderMap,
) -> ApiResult {
    let committee: Committee = store.get_one(&id).await?;
    conditional_json_response(&headers, &committee)
}

pub async fn get_committees(store: CommitteeStore, headers: HeaderMap) -> ApiResult {
    let committees: Vec<Committee> = store.get_all().await?;
    conditional_json_response(&headers, &committees)
}

pub async fn create_committee(
    store: CommitteeStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<CommitteeContent>,
) -> ApiResult {
    is_admin_or_board(&session)?;
    store.create(new).await.into_api()
}

pub async fn update_committee(
    store: CommitteeStore,
    session: Session,
    Path(id): Path<CommitteeId>,
    ValidatedJson(updated): ValidatedJson<CommitteeContent>,
) -> ApiResult {
    committee_access(&session, &id, &store).await?;
    store.update(&id, updated).await.into_api()
}

pub async fn delete_committee(
    store: CommitteeStore,
    session: Session,
    Path(id): Path<CommitteeId>,
) -> ApiResult {
    committee_access(&session, &id, &store).await?;
    store.delete(&id).await.into_api()
}

/// Add a user to a committee. Returns the [`BasicUser`] that was added
pub async fn add_user_to_committee(
    store: CommitteeStore,
    session: Session,
    Path((id, user_id)): Path<(CommitteeId, UserId)>,
) -> ApiResult {
    committee_access(&session, &id, &store).await?;
    store.add_user(&id, &user_id).await.into_api()
}

pub async fn remove_user_from_committee(
    store: CommitteeStore,
    session: Session,
    Path((id, user_id)): Path<(CommitteeId, UserId)>,
) -> ApiResult {
    committee_access(&session, &id, &store).await?;
    store.remove_user(&id, &user_id).await.into_api()
}

pub async fn get_committee_members(
    store: CommitteeStore,
    Path(id): Path<CommitteeId>,
    session: Session,
    headers: HeaderMap,
) -> ApiResult {
    if session.is_member() {
        let members = store.get_committee_members(&id).await?;
        conditional_json_response(&headers, &members)
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_user_committees(
    store: CommitteeStore,
    Path(id): Path<UserId>,
    session: Session,
    headers: HeaderMap,
) -> ApiResult {
    if session.is_member() {
        let committees = store.get_committees_for_user(&id).await?;
        conditional_json_response(&headers, &committees)
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn make_chair(
    store: CommitteeStore,
    session: Session,
    Path((committee_id, user_id)): Path<(CommitteeId, UserId)>,
) -> ApiResult {
    committee_access(&session, &committee_id, &store).await?;
    store
        .ensure_user_in_committee(&user_id, &committee_id)
        .await?;
    store.make_chair(&committee_id, &user_id).await.into_api()
}
