use crate::{Language, file::FileId, user::UserId};
use serde::{Deserialize, Serialize};
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(transparent)]
pub struct PageId(Uuid);

impl From<Uuid> for PageId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for PageId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct PageContent {
    #[validate(nested)]
    pub name: Language,
    #[validate(length(min = 1, max = 200))]
    pub slug: String,
    #[validate(nested)]
    #[serde(default)]
    pub content: Language,
    pub image: Option<FileId>,
    pub is_public: bool,
}

#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub page_id: PageId,
    #[serde(flatten)]
    #[validate(nested)]
    pub content: PageContent,
    pub created_by: UserId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
}
