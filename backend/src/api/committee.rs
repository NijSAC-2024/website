use crate::api::is_admin_or_board;
use crate::committee::CommitteeRole;
use crate::{
    ValidatedJson,
    api::ApiResult,
    auth::session::Session,
    committee::{Committee, CommitteeContent, CommitteeId, UserCommittee},
    data_source::committee::CommitteeStore,
    error::{AppResult, Error},
    user::{BasicUser, UserId},
};
use axum::{Json, extract::Path};

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

pub async fn get_committee(
    store: CommitteeStore,
    Path(id): Path<CommitteeId>,
) -> ApiResult<Committee> {
    store.get_one(&id).await.map(Into::into)
}

pub async fn get_committees(store: CommitteeStore) -> ApiResult<Vec<Committee>> {
    store.get_all().await.map(Into::into)
}

pub async fn create_committee(
    store: CommitteeStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<CommitteeContent>,
) -> ApiResult<Committee> {
    is_admin_or_board(&session)?;
    store.create(new).await.map(Into::into)
}

pub async fn update_committee(
    store: CommitteeStore,
    session: Session,
    Path(id): Path<CommitteeId>,
    ValidatedJson(updated): ValidatedJson<CommitteeContent>,
) -> ApiResult<Committee> {
    committee_access(&session, &id, &store).await?;
    store.update(&id, updated).await.map(Into::into)
}

pub async fn delete_committee(
    store: CommitteeStore,
    session: Session,
    Path(id): Path<CommitteeId>,
) -> AppResult<()> {
    committee_access(&session, &id, &store).await?;
    store.delete(&id).await
}

pub async fn add_user_to_committee(
    store: CommitteeStore,
    session: Session,
    Path((id, user_id)): Path<(CommitteeId, UserId)>,
) -> ApiResult<()> {
    committee_access(&session, &id, &store).await?;
    Ok(Json(store.add_user(&id, &user_id).await?))
}

pub async fn remove_user_from_committee(
    store: CommitteeStore,
    session: Session,
    Path((id, user_id)): Path<(CommitteeId, UserId)>,
) -> AppResult<()> {
    committee_access(&session, &id, &store).await?;
    store.remove_user(&id, &user_id).await?;
    Ok(())
}

pub async fn get_committee_members(
    store: CommitteeStore,
    Path(id): Path<CommitteeId>,
    session: Session,
) -> ApiResult<Vec<BasicUser>> {
    if session.membership_status().is_member() {
        Ok(Json(store.get_committee_members(&id).await?))
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_user_committees(
    store: CommitteeStore,
    Path(id): Path<UserId>,
    session: Session,
) -> ApiResult<Vec<UserCommittee>> {
    if session.membership_status().is_member() {
        Ok(Json(store.get_committees_for_user(&id).await?))
    } else {
        Err(Error::Unauthorized)
    }
}
