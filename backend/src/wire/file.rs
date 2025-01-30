use crate::user::UserId;
use mime::Mime;
use object_store::path::Path;
use serde::{Deserialize, Serialize, Serializer};
use serde_with::skip_serializing_none;
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(transparent)]
pub struct FileId(Uuid);

impl From<Uuid> for FileId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for FileId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<&FileId> for Path {
    fn from(id: &FileId) -> Self {
        Path::from_absolute_path(format!("/{}", **id))
            .expect("/<uuid> must always produce a valid path")
    }
}

#[skip_serializing_none]
#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub id: FileId,
    pub original_filename: String,
    #[serde(serialize_with = "serialize_mime")]
    pub mime_type: Option<Mime>,
    pub size: i32,
    pub created_by: UserId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
}

fn serialize_mime<S>(mime: &Option<Mime>, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match mime {
        None => s.serialize_none(),
        Some(mime) => s.serialize_str(mime.as_ref()),
    }
}
