use crate::{
    auth::role::{MembershipStatus, Roles},
    error::Error,
};
use argon2::{
    password_hash,
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use sqlx::FromRow;
use std::{
    fmt::{Debug, Formatter},
    ops::Deref,
};
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
pub struct UserContent {
    #[validate(length(min = 1, max = 100))]
    pub first_name: String,
    #[validate(length(min = 1, max = 100))]
    pub infix: Option<String>,
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
    #[validate(length(min = 1, max = 10000))]
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
    password: String,
}

impl UserCredentials {
    pub fn verify_pwd(&self, hash: &PasswordHash) -> Result<(), Error> {
        Argon2::default()
            .verify_password(self.password.as_bytes(), hash)
            .map_err(|err| match err {
                password_hash::Error::Password => Error::Unauthorized,
                _ => Error::Argon2(err),
            })
    }
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Password {
    #[validate(length(min = 10, max = 128))]
    password: String,
}

impl Password {
    pub fn pwd_hash(&self) -> Result<String, Error> {
        let salt = SaltString::generate(&mut OsRng);
        Ok(Argon2::default()
            .hash_password(self.password.as_bytes(), &salt)
            .map_err(Error::Argon2)?
            .to_string())
    }
}

impl Debug for UserCredentials {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("UserCredentials")
            .field("email", &self.email)
            .field("password", &"****")
            .finish()
    }
}

#[derive(Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
pub struct RegisterNewUser {
    #[validate(length(min = 1, max = 100))]
    pub first_name: String,
    #[validate(length(min = 1, max = 100))]
    pub infix: Option<String>,
    #[validate(length(min = 1, max = 100))]
    pub last_name: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(
        min = 10,
        max = 128,
        message = "Password must contain between 10 and 128 characters"
    ))]
    password: String,
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

impl RegisterNewUser {
    pub fn pwd_hash(&self) -> Result<String, Error> {
        let salt = SaltString::generate(&mut OsRng);
        Ok(Argon2::default()
            .hash_password(self.password.as_bytes(), &salt)
            .map_err(Error::Argon2)?
            .to_string())
    }
}

impl Debug for RegisterNewUser {
    fn fmt(&self, _: &mut Formatter<'_>) -> std::fmt::Result {
        unimplemented!(
            "This is a placeholder to make sure you don't accidentally derive 'Debug'.\
                If you need a debug implementation, make sure to exclude the password field"
        )
    }
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
