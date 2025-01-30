use crate::{
    error::{AppResult, Error},
    file::{FileId, FileMetadata},
    user::UserId,
    AppState, Pagination,
};
use axum::{extract::FromRequestParts, http::request::Parts};
use bytes::Bytes;
use mime::Mime;
use object_store::{ObjectStore, PutPayload};
use sqlx::PgPool;
use std::sync::Arc;
use time::OffsetDateTime;
use uuid::Uuid;

pub struct FileStore {
    db: PgPool,
    object_store: Arc<dyn ObjectStore>,
}

impl FromRequestParts<AppState> for FileStore {
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(Self {
            db: state.pool().clone(),
            object_store: state.object_store(),
        })
    }
}

struct PgFileMetadata {
    pub id: Uuid,
    pub original_filename: String,
    pub mime_type: Option<String>,
    pub size: i32,
    pub created_by: UserId,
    pub created: OffsetDateTime,
}

impl TryFrom<PgFileMetadata> for FileMetadata {
    type Error = Error;

    fn try_from(pg: PgFileMetadata) -> Result<Self, Self::Error> {
        Ok(Self {
            id: pg.id.into(),
            original_filename: pg.original_filename,
            mime_type: pg
                .mime_type
                .map(|s| s.parse())
                .transpose()
                .map_err(|_| Error::Internal("Failed to parse MIME string".to_string()))?,
            size: pg.size,
            created_by: pg.created_by,
            created: pg.created,
        })
    }
}

impl FileStore {
    pub async fn create(
        &self,
        original_filename: &str,
        mime_type: Option<Mime>,
        created_by: &UserId,
        payload: Bytes,
    ) -> AppResult<FileMetadata> {
        let file_id: FileId = Uuid::now_v7().into();

        let size = payload.len();
        self.object_store
            .put(&(&file_id).into(), PutPayload::from_bytes(payload))
            .await?;

        sqlx::query_as!(
            PgFileMetadata,
            r#"
            INSERT INTO file (id, original_filename, mime_type, size, created_by, created)
            VALUES ($1, $2, $3, $4, $5, now())
            RETURNING id, original_filename, mime_type, size, created_by, created
            "#,
            *file_id,
            original_filename,
            mime_type.map(|mime| mime.to_string()),
            size as i32,
            **created_by
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get_metadata(&self, id: &FileId) -> AppResult<FileMetadata> {
        sqlx::query_as!(
            PgFileMetadata,
            r#"
            SELECT * FROM file WHERE id = $1
            "#,
            **id,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get_bytes(&self, id: &FileId) -> AppResult<Bytes> {
        Ok(self.object_store.get(&id.into()).await?.bytes().await?)
    }

    pub async fn get_all_metadata(&self, pagination: Pagination) -> AppResult<Vec<FileMetadata>> {
        sqlx::query_as!(
            PgFileMetadata,
            r#"
            SELECT * FROM file
            ORDER BY created
            LIMIT $1 OFFSET $2
            "#,
            pagination.limit,
            pagination.offset
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(TryInto::try_into)
        .collect()
    }
}
