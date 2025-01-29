use crate::{
    api::{ApiResult, ValidatedJson, ValidatedQuery},
    auth::{
        role::{MembershipStatus, Role},
        session::Session,
    },
    data_source::UserStore,
    error::{AppResult, Error},
    user::{RegisterNewUser, User, UserContent, UserId},
    Pagination,
};
use axum::{
    extract::Path,
    http::{HeaderMap, StatusCode},
    Json,
};

fn read_access(id: &UserId, session: &Session) -> AppResult<()> {
    if read_all_access(session).is_ok() || id == session.user_id() {
        Ok(())
    } else {
        Err(Error::NotFound)
    }
}

fn read_all_access(session: &Session) -> AppResult<()> {
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
    Email,
}

fn update_access(id: &UserId, session: &Session) -> AppResult<UpdateAccess> {
    if read_all_access(session).is_ok() {
        Ok(UpdateAccess::Anything)
    } else if id == session.user_id() {
        Ok(UpdateAccess::Email)
    } else {
        Err(Error::NotFound)
    }
}

pub async fn register(
    store: UserStore,
    ValidatedJson(new): ValidatedJson<RegisterNewUser>,
) -> AppResult<(StatusCode, Json<User>)> {
    let user = UserContent {
        first_name: new.first_name,
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
    store.update_pwd(&user.id, Some(&new.password)).await?;

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
) -> AppResult<(HeaderMap, Json<Vec<User>>)> {
    read_all_access(&session)?;

    let total = store.count().await?;
    Ok((total.as_header(), Json(store.get_all(&pagination).await?)))
}

pub async fn update_user(
    store: UserStore,
    session: Session,
    Path(id): Path<UserId>,
    ValidatedJson(user): ValidatedJson<UserContent>,
) -> ApiResult<User> {
    let res = match update_access(&id, &session)? {
        UpdateAccess::Anything => store.update(&id, user).await,
        UpdateAccess::Email => store.update_email(&id, &user.email).await,
    }?;

    Ok(Json(res))
}
