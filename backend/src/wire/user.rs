use crate::auth::role::{MembershipStatus, Roles};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use sqlx::FromRow;
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
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

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserContent {
    #[validate(length(min = 1, max = 100))]
    pub first_name: String,
    #[validate(length(min = 1, max = 100))]
    pub last_name: String,
    pub phone: String,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "Student Number must contain a maximum of 9 numbers"
    ))]
    pub student_number: Option<i32>,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "NKBV Number must contain a maximum of 9 numbers"
    ))]
    pub nkbv_number: Option<i32>,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "Sportcard Number must contain a maximum of 9 numbers"
    ))]
    pub sportcard_number: Option<i32>,
    #[validate(length(min = 1, max = 100))]
    pub ice_contact_name: Option<String>,
    #[validate(email)]
    pub ice_contact_email: Option<String>,
    #[validate(length(min = 1, max = 100))]
    pub ice_contact_phone: Option<String>,
    #[validate(length(min = 1, max = 100))]
    pub important_info: Option<String>,
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

#[derive(Deserialize, Validate)]
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
    pub phone: String,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "Student Number must contain a maximum of 9 numbers"
    ))]
    pub student_number: Option<i32>,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "NKBV Number must contain a maximum of 9 numbers"
    ))]
    pub nkbv_number: Option<i32>,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "Sportcard Number must contain a maximum of 9 numbers"
    ))]
    pub sportcard_number: Option<i32>,
    #[validate(length(min = 1, max = 100))]
    pub ice_contact_name: Option<String>,
    #[validate(email)]
    pub ice_contact_email: Option<String>,
    #[validate(length(min = 1, max = 100))]
    pub ice_contact_phone: Option<String>,
    #[validate(length(min = 1, max = 10000))]
    pub important_info: Option<String>,
    pub status: MembershipStatus,
}

#[skip_serializing_none]
#[derive(Serialize, Debug, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct BasicUser {
    pub user_id: UserId,
    pub first_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub infix: Option<String>,
    pub last_name: String,
}
