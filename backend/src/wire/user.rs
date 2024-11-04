use crate::auth::role::{MembershipStatus, Roles};
use serde::{Deserialize, Serialize};
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(transparent)]
pub struct UserId(Uuid);

impl From<Uuid> for UserId {
    fn from(id: Uuid) -> Self {
        UserId(id)
    }
}

impl Deref for UserId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub(crate) id: UserId,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) updated: OffsetDateTime,
    #[serde(flatten)]
    #[validate(nested)]
    pub(crate) content: UserContent,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserContent {
    #[validate(length(min = 1, max = 100))]
    pub first_name: String,
    #[validate(length(min = 1, max = 100))]
    pub last_name: String,
    pub roles: Roles,
    pub status: MembershipStatus,
    #[validate(email)]
    pub email: String,
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct UserCredentials {
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 1, max = 128))]
    pub password: String,
}

#[derive(Serialize, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterNewUser {
    #[validate(length(min = 1, max = 100))]
    pub first_name: String,
    #[validate(length(min = 1, max = 100))]
    pub last_name: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(
        min = 10,
        max = 128,
        message = "Password must contain between 10 and 128 characters"
    ))]
    pub password: String,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BasicUser {
    id: UserId,
    first_name: String,
    last_name: String,
}
