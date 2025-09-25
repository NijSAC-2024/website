use crate::Language;
use serde::{Deserialize, Serialize};
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

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

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct Page {
    pub page_id: Uuid,
    #[validate(length(min = 1, max = 100))]
    pub slug: String,
    pub content: PageContent,
    pub created_by: Uuid,
    pub created: OffsetDateTime,
    pub updated: OffsetDateTime,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct PageContent {
    pub name: Language,
    pub content: Language,
    pub is_public: bool,
}
