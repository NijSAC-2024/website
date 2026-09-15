use crate::{
    AppResult, Pagination,
    api::{
        ApiResult, IntoApiResult, ValidatedJson, ValidatedQuery, conditional_json_response,
        is_admin_or_board,
    },
    auth::{role::Status, session::Session},
    data_source::UserStore,
    error::Error,
    user::{Password, RegisterNewUser, UserContent, UserId},
};
use axum::{
    Json,
    extract::Path,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
};
use axum_extra::extract::CookieJar;
use sqlx::PgPool;

enum UpdateAccess {
    Anything,
    SelfUpdate,
}

fn update_access(id: &UserId, session: &Session) -> AppResult<UpdateAccess> {
    if is_admin_or_board(session).is_ok() {
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
    if is_admin_or_board(session).is_ok() {
        Ok(ReadAccess::Full)
    } else if session.is_member() {
        Ok(ReadAccess::Limited)
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn register(
    db: PgPool,
    store: UserStore,
    jar: CookieJar,
    ValidatedJson(new): ValidatedJson<RegisterNewUser>,
) -> AppResult<impl IntoResponse> {
    let pwd_hash = new.pwd_hash()?;
    let user = UserContent {
        first_name: new.first_name,
        infix: new.infix,
        last_name: new.last_name,
        roles: vec![],
        membership: new.membership,
        status: Status::Pending,
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

    let session = Session::new(&db, &user.id).await?;

    Ok((
        StatusCode::CREATED,
        jar.add(session.into_cookie()),
        Json(user),
    ))
}

pub async fn who_am_i(store: UserStore, session: Option<Session>, headers: HeaderMap) -> ApiResult {
    if let Some(session) = session {
        let user = store.get(session.user_id()).await?;
        conditional_json_response(&headers, &user)
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_user(
    store: UserStore,
    Path(id): Path<UserId>,
    session: Session,
    headers: HeaderMap,
) -> ApiResult {
    if id == *session.user_id() {
        let user = store.get(&id).await?;
        return conditional_json_response(&headers, &user);
    }
    match read_all_access(&session)? {
        ReadAccess::Full => {
            let user = store.get(&id).await?;
            conditional_json_response(&headers, &user)
        }
        ReadAccess::Limited => {
            let user = store.get_basic_info(&id).await?;
            conditional_json_response(&headers, &user)
        }
    }
}

pub async fn get_all_users(
    store: UserStore,
    session: Session,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
    headers: HeaderMap,
) -> ApiResult {
    match read_all_access(&session)? {
        ReadAccess::Full => {
            let users = store.get_all_detailed(&pagination).await?;
            conditional_json_response(&headers, &users)
        }
        ReadAccess::Limited => {
            let users = store.get_all_basic_info(&pagination).await?;
            conditional_json_response(&headers, &users)
        }
    }
}

pub async fn update_user(
    store: UserStore,
    session: Session,
    Path(id): Path<UserId>,
    ValidatedJson(user): ValidatedJson<UserContent>,
) -> ApiResult {
    match update_access(&id, &session)? {
        UpdateAccess::Anything => store.update(&id, user).await,
        UpdateAccess::SelfUpdate => store.self_update(&id, user).await,
    }
    .into_api()
}

pub async fn update_pwd(
    store: UserStore,
    session: Session,
    Path(id): Path<UserId>,
    ValidatedJson(pwd): ValidatedJson<Password>,
) -> ApiResult {
    update_access(&id, &session)?;
    store
        .update_pwd(&id, Some(&pwd.pwd_hash()?))
        .await
        .into_api()
}

pub async fn delete_user(store: UserStore, session: Session, Path(id): Path<UserId>) -> ApiResult {
    is_admin_or_board(&session)?;
    store.delete(&id).await.into_api()
}
