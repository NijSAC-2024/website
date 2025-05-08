use crate::{event::EventId, Language};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(transparent)]
pub struct LocationId(Uuid);

impl From<Uuid> for LocationId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for LocationId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[skip_serializing_none]
#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub id: LocationId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
    #[serde(flatten)]
    #[validate(nested)]
    pub content: LocationContent,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, Validate, Default)]
#[serde(rename_all = "camelCase")]
pub struct LocationContent {
    #[validate(nested)]
    pub name: Language,
    pub reusable: bool,
    #[validate(nested)]
    #[serde(default)]
    pub description: Language,
}

#[skip_serializing_none]
#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UsedBy {
    pub activities: Vec<EventId>,
}
