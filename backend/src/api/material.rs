use crate::api::read_access;
use crate::api::read_all_access;
use crate::api::update_access;
use crate::{
    api::{ApiResult, ValidatedJson, ValidatedQuery},
    auth::{
        session::Session,
    },
    data_source::{MaterialStore},
    error::{AppResult},
    material::{Material, UserMaterial},
    user::{UserId},
    Pagination,
};
use axum::{
    extract::Path,
    http::{HeaderMap},
    Json,
};

pub(crate) async fn get_user_materials(
    store: MaterialStore,
    Path(user_id): Path<UserId>,
    session: Session,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
) -> AppResult<(HeaderMap, Json<Vec<UserMaterial>>)> {
    read_access(&user_id, &session)?;

    let total = store.count(&user_id).await?;
    Ok((
        total.as_header(),
        Json(store.get_user_materials(&user_id, &pagination).await?),
    ))
}

pub(crate) async fn update_user_material(
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

pub(crate) async fn get_material_list(
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
