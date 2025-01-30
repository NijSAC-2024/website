use crate::{
    api::ApiResult,
    auth::{role::Role, session::Session},
    data_source::FileStore,
    error::{AppResult, Error},
    file::{FileId, FileMetadata},
    Pagination, ValidatedQuery,
};
use axum::{
    extract::{Multipart, Path},
    http::{header::CONTENT_TYPE, HeaderMap},
    response::IntoResponse,
    Json,
};
use mime::Mime;
use tracing::info;

fn upload_access(session: &Session) -> AppResult<()> {
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

pub async fn upload(
    store: FileStore,
    session: Session,
    mut multipart: Multipart,
) -> ApiResult<Vec<FileMetadata>> {
    upload_access(&session)?;

    let mut result = vec![];
    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();
        let content_type: Option<Mime> = field
            .content_type()
            .map(|s| s.parse())
            .transpose()
            .map_err(|_| Error::BadRequest("Could not parse MIME type"))?;
        let data = field.bytes().await.unwrap();
        let len = data.len();

        result.push(
            store
                .create(&name, content_type, session.user_id(), data)
                .await?,
        );
        info!(
            "User {} Uploaded file '{}' with {} bytes",
            &session.user_id(),
            &name,
            len
        )
    }
    Ok(Json(result))
}

pub async fn get_file_content(
    store: FileStore,
    Path(id): Path<FileId>,
) -> AppResult<impl IntoResponse> {
    let meta = store.get_metadata(&id).await?;
    let bytes = store.get_bytes(&id).await?;

    let mut headers = HeaderMap::new();
    if let Some(mime) = meta.mime_type {
        headers.insert(CONTENT_TYPE, mime.to_string().parse().unwrap());
    }
    Ok((headers, bytes))
}

pub async fn get_file_metadata(
    store: FileStore,
    Path(id): Path<FileId>,
) -> ApiResult<FileMetadata> {
    Ok(Json(store.get_metadata(&id).await?))
}

pub async fn get_files(
    store: FileStore,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
) -> ApiResult<Vec<FileMetadata>> {
    Ok(Json(store.get_all_metadata(pagination).await?))
}
