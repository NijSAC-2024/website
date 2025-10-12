use crate::{
    ValidatedJson,
    api::ApiResult,
    auth::{role::Role, session::Session},
    data_source::committee::CommitteeStore,
    error::{AppResult, Error},
    committee::{Committee, CommitteeContent, UserCommittee, CommitteeId},
    user::{UserId, BasicUser},
};
use axum::{
    Json,
    extract::Path,
};

fn update_committee_access(session: &Session) -> AppResult<()> {
    if session.roles().iter().any(|role| matches!(role, Role::Admin | Role::Chair | Role::ViceChair)) {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn get_user_committees_access(id: &UserId, session: &Session) -> AppResult<()> {
    if update_committee_access(session).is_ok() || id == session.user_id() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_committee(store: CommitteeStore, Path(id): Path<CommitteeId>) -> ApiResult<Committee> {
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
    update_committee_access(&session)?;
    store.create(new).await.map(Into::into)
}

pub async fn update_committee(
    store: CommitteeStore,
    session: Session,
    Path(id): Path<CommitteeId>,
    ValidatedJson(updated): ValidatedJson<CommitteeContent>,
) -> ApiResult<Committee> {
    update_committee_access(&session)?;
    store.update(&id, updated).await.map(Into::into)
}

pub async fn delete_committee(
    store: CommitteeStore,
    session: Session,
    Path(id): Path<CommitteeId>,
) -> AppResult<()> {
    update_committee_access(&session)?;
    store.delete(&id).await
}

pub async fn add_user_to_committee(
    store: CommitteeStore,
    session: Session,
    Path((id, user_id)): Path<(CommitteeId, UserId)>,
) -> ApiResult<()> {
    update_committee_access(&session)?;
    Ok(Json(store.add_user(&id, &user_id).await?))
}

pub async fn remove_user_from_committee(
    store: CommitteeStore,
    session: Session,
    Path((id, user_id)): Path<(CommitteeId, UserId)>,
) -> AppResult<()> {
    update_committee_access(&session)?;
    store.remove_user(&id, &user_id).await?;
    Ok(())
}

pub async fn get_committee_members(
    store: CommitteeStore,
    Path(id): Path<CommitteeId>,
) -> ApiResult<Vec<BasicUser>> {
    let members = store.get_committee_members(&id).await?;
    Ok(Json(members))
}

pub async fn get_user_committees(
    store: CommitteeStore,
    Path(id): Path<UserId>,
    session: Session
) -> ApiResult<Vec<UserCommittee>> {
    get_user_committees_access(&id, &session)?;
    let committees = store.get_committees_for_user(&id).await?;
    Ok(Json(committees))
}

