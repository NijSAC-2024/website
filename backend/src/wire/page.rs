use crate::{Language, file::FileId, user::UserId};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

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
    pub page_id: Uuid,
    #[serde(flatten)]
    #[validate(nested)]
    pub content: PageContent,
    pub created_by: UserId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
}
