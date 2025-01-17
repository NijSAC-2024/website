use crate::auth::role::Role;
use crate::error::Error;
use crate::{
    api::{ApiResult, ValidatedJson, ValidatedQuery},
    auth::session::Session,
    data_source::MaterialStore,
    error::AppResult,
    material::{Material, UserMaterial},
    user::UserId,
    Pagination,
};
use axum::{extract::Path, http::HeaderMap, Json};

// TODO this needs some rework

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


fn update_access(id: &UserId, session: &Session) -> AppResult<()> {
    if read_all_access(session).is_ok() || id == session.user_id() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_user_materials(
    store: MaterialStore,
    Path(user_id): Path<UserId>,
    session: Session,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
) -> AppResult<(HeaderMap, Json<Vec<UserMaterial>>)> {
    update_access(&user_id, &session)?;

    let total = store.count(&user_id).await?;
    Ok((
        total.as_header(),
        Json(store.get_user_materials(&user_id, &pagination).await?),
    ))
}

pub async fn update_user_material(
    store: MaterialStore,
    session: Session,
    ValidatedJson(update_data): ValidatedJson<UserMaterial>,
) -> ApiResult<Option<UserMaterial>> {
    update_access(&update_data.user_id.into(), &session)?;

    let res = store
        .update_user_material(
            &update_data.user_id,
            &update_data.material_id,
            update_data.material_amount,
        )
        .await?;
    Ok(Json(res))
}

pub async fn get_material_list(
    store: MaterialStore,
    session: Session,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
) -> AppResult<(HeaderMap, Json<Vec<Material>>)> {
    read_all_access(&session)?;
    let total = store.count_materials().await?;
    Ok((
        total.as_header(),
        Json(store.get_material_list(&pagination).await?),
    ))
}
