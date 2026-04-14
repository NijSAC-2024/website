use crate::{
    Language,
    file::FileId,
    user::{BasicUser, UserId},
};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(transparent)]
pub struct CommitteeId(Uuid);

impl From<Uuid> for CommitteeId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for CommitteeId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(sqlx::Type, Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq)]
#[sqlx(type_name = "committee_role", rename_all = "snake_case")]
#[serde(rename_all = "camelCase")]
pub enum CommitteeRole {
    Chair,
    Member,
}

#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Committee {
    pub id: CommitteeId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
    #[serde(flatten)]
    #[validate(nested)]
    pub content: CommitteeContent,
}

#[derive(Serialize, Deserialize, Debug, Validate, Default)]
#[serde(rename_all = "camelCase")]
pub struct CommitteeContent {
    #[validate(nested)]
    pub name: Language,
    #[validate(nested)]
    #[serde(default)]
    pub description: Language,
    pub image: Option<FileId>,
}

fn serialize_option<S>(date: &Option<OffsetDateTime>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match date {
        Some(dt) => time::serde::rfc3339::serialize(dt, serializer),
        None => serializer.serialize_none(),
    }
}

fn deserialize_option<'de, D>(deserializer: D) -> Result<Option<OffsetDateTime>, D::Error>
where
    D: Deserializer<'de>,
{
    Option::<OffsetDateTime>::deserialize(deserializer)
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UserCommittee {
    pub user_id: UserId,
    pub committee_id: CommitteeId,
    pub role: CommitteeRole,
    #[serde(with = "time::serde::rfc3339")]
    pub joined: OffsetDateTime,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(
        serialize_with = "serialize_option",
        deserialize_with = "deserialize_option"
    )]
    pub left: Option<OffsetDateTime>,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CommitteeUser {
    #[serde(flatten)]
    pub user: BasicUser,
    pub role: CommitteeRole,
}
