use crate::{
    api::{ApiResult, ValidatedJson, ValidatedQuery},
    auth::{
        role::{MembershipStatus, Role},
        session::Session,
    },
    data_source::UserStore,
    error::{AppResult, Error},
    user::{Password, RegisterNewUser, User, UserContent, UserId},
    Pagination,
};
use axum::{
    extract::Path,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

fn read_access(id: &UserId, session: &Session) -> AppResult<()> {
    if update_all_access(session).is_ok() || id == session.user_id() {
        Ok(())
    } else {
        Err(Error::NotFound)
    }
}

fn update_all_access(session: &Session) -> AppResult<()> {
    if session.membership_status().is_member()
        && session.roles().iter().any(|role| match role {
            Role::Admin
            | Role::Treasurer
            | Role::Secretary
            | Role::Chair
            | Role::ViceChair
            | Role::ClimbingCommissar => true,
            Role::ActivityCommissionMember => false,
        })
    {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

enum UpdateAccess {
    Anything,
    SelfUpdate,
}

fn update_access(id: &UserId, session: &Session) -> AppResult<UpdateAccess> {
    if update_all_access(session).is_ok() {
        Ok(UpdateAccess::Anything)
    } else if id == session.user_id() {
        Ok(UpdateAccess::SelfUpdate)
    } else {
        Err(Error::NotFound)
    }
}

enum ReadAccess {
    /// Full read access of all details of all users
    Full,
    /// Limited read access of user details. Granted to "normal" members.
    Limited,
}

fn read_all_access(session: &Session) -> AppResult<ReadAccess> {
    if update_all_access(session).is_ok() {
        Ok(ReadAccess::Full)
    } else if session.membership_status().is_member() {
        Ok(ReadAccess::Limited)
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn register(
    store: UserStore,
    ValidatedJson(new): ValidatedJson<RegisterNewUser>,
) -> AppResult<(StatusCode, Json<User>)> {
    let pwd_hash = new.pwd_hash()?;
    let user = UserContent {
        first_name: new.first_name,
        infix: new.infix,
        last_name: new.last_name,
        roles: vec![],
        status: MembershipStatus::Pending,
        email: new.email,
        phone: new.phone,
        student_number: new.student_number,
        nkbv_number: new.nkbv_number,
        sportcard_number: new.sportcard_number,
        ice_contact_name: new.ice_contact_name,
        ice_contact_email: new.ice_contact_email,
        ice_contact_phone: new.ice_contact_phone,
        important_info: new.important_info,
    };

    let user = store.create(&user).await?;
    store.update_pwd(&user.id, Some(&pwd_hash)).await?;

    Ok((StatusCode::CREATED, Json(user)))
}

pub async fn who_am_i(store: UserStore, session: Session) -> ApiResult<User> {
    Ok(Json(store.get(session.user_id()).await?))
}

pub async fn get_user(
    store: UserStore,
    Path(id): Path<UserId>,
    session: Session,
) -> ApiResult<User> {
    read_access(&id, &session)?;

    Ok(Json(store.get(&id).await?))
}

pub async fn get_all_users(
    store: UserStore,
    session: Session,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
) -> AppResult<Response> {
    let total = store.count().await?;

    match read_all_access(&session)? {
        ReadAccess::Full => Ok((
            total.as_header(),
            Json(store.get_all_detailed(&pagination).await?),
        )
            .into_response()),
        ReadAccess::Limited => Ok((
            total.as_header(),
            Json(store.get_all_basic_info(&pagination).await?),
        )
            .into_response()),
    }
}

pub async fn update_user(
    store: UserStore,
    session: Session,
    Path(id): Path<UserId>,
    ValidatedJson(user): ValidatedJson<UserContent>,
) -> ApiResult<User> {
    let res = match update_access(&id, &session)? {
        UpdateAccess::Anything => store.update(&id, user).await,
        UpdateAccess::SelfUpdate => store.self_update(&id, user).await,
    }?;

    Ok(Json(res))
}

pub async fn update_pwd(
    store: UserStore,
    session: Session,
    Path(id): Path<UserId>,
    ValidatedJson(pwd): ValidatedJson<Password>,
) -> AppResult<()> {
    update_access(&id, &session)?;
    store.update_pwd(&id, Some(&pwd.pwd_hash()?)).await
}

pub async fn delete_user(
    store: UserStore,
    session: Session,
    Path(id): Path<UserId>,
) -> AppResult<()> {
    update_all_access(&session)?;
    store.delete(&id).await
}
