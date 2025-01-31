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
use bytes::Bytes;
use image::{
    codecs::{jpeg::JpegEncoder, webp::WebPEncoder},
    load_from_memory,
};
use mime::{Mime, IMAGE, IMAGE_JPEG};
use std::io::Cursor;
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
        let mut content_type: Option<Mime> = field
            .content_type()
            .map(|s| s.parse())
            .transpose()
            .map_err(|_| Error::BadRequest("Could not parse MIME type"))?;
        let mut data = field.bytes().await.unwrap();

        if let Some(c_t) = &content_type {
            if c_t.type_() == IMAGE {
                let (d, c) = reduce_image_size(&data)?;
                (data, content_type) = (d, Some(c));
            }
        }

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

fn reduce_image_size(bytes: &[u8]) -> AppResult<(Bytes, Mime)> {
    let mut image = load_from_memory(bytes)?;
    if image.width() > 1500 || image.height() > 1500 {
        image = image.thumbnail(1500, 1500);
    }

    let mut buf = Vec::new();
    let writer = Cursor::new(&mut buf);

    let encoder = JpegEncoder::new_with_quality(writer, 80);
    let mime = match image.write_with_encoder(encoder) {
        Ok(_) => IMAGE_JPEG,
        Err(_) => {
            let writer = Cursor::new(&mut buf);
            let encoder = WebPEncoder::new_lossless(writer);
            image.write_with_encoder(encoder)?;
            "image/webp".parse().unwrap()
        }
    };

    Ok((buf.into(), mime))
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
    session: Session,
    ValidatedQuery(pagination): ValidatedQuery<Pagination>,
) -> AppResult<(HeaderMap, Json<Vec<FileMetadata>>)> {
    upload_access(&session)?;
    let total = store.count().await?;

    Ok((
        total.as_header(),
        Json(store.get_all_metadata(pagination).await?),
    ))
}
