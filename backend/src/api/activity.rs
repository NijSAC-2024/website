use crate::{
    api::{read_all_access, ApiResult},
    auth::session::Session,
    data_source::activity::ActivityStore,
    user::BasicUser,
    wire::activity::ActivityId,
};
use axum::{extract::Path, Json};

pub(crate) async fn get_activity_registrations(
    store: ActivityStore,
    Path(id): Path<ActivityId>,
    session: Session,
) -> ApiResult<Vec<BasicUser>> {
    read_all_access(&session)?;

    let res = store.get_registrations(id).await?;
    Ok(Json(res))
}
