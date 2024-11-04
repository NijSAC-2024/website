use crate::user::{BasicUser, User};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::fmt::Debug;
use std::ops::Deref;
use time::{Date, OffsetDateTime};
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(transparent)]
pub struct WeekendId(Uuid);

impl From<Uuid> for WeekendId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for WeekendId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Weekend<T>
where
    T: Validate,
{
    pub(crate) id: WeekendId,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) updated: OffsetDateTime,
    #[serde(flatten)]
    #[validate(nested)]
    pub(crate) content: T,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
#[validate(schema(function = "validate_weekend"))]
pub(crate) struct WeekendContent {
    pub start: Date,
    pub end: Date,
    pub registration_start: OffsetDateTime,
    pub registration_end: OffsetDateTime,
    pub location: LocationId,
    pub weekend_type: WeekendTypeId,
    pub description: Option<String>,
}

fn validate_weekend(weekend: &WeekendContent) -> Result<(), ValidationError> {
    if weekend.start > weekend.end {
        Err(ValidationError::new("date").with_message(Cow::Borrowed("Start cannot be after end")))
    } else if weekend.registration_start > weekend.registration_end {
        Err(ValidationError::new("date").with_message(Cow::Borrowed(
            "registration start cannot be later than registration end",
        )))
    } else {
        Ok(())
    }
}

#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WeekendContentHydrated {
    pub start: Date,
    pub end: Date,
    pub registration_start: OffsetDateTime,
    pub registration_end: OffsetDateTime,
    pub location: Location,
    pub weekend_type: WeekendType,
    pub description: Option<String>,
    pub registrations: Vec<BasicUser>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(transparent)]
pub struct WeekendTypeId(Uuid);

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(transparent)]
pub struct LocationId(Uuid);

impl From<Uuid> for WeekendTypeId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for WeekendTypeId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

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

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    id: LocationId,
    name: String,
    description: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct WeekendType {
    id: WeekendTypeId,
    name: String,
    description: Option<String>,
}
