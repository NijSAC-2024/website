use crate::user::BasicUser;
use serde::{Deserialize, Serialize};
use std::{borrow::Cow, ops::Deref};
use time::OffsetDateTime;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(transparent)]
pub struct ActivityId(Uuid);
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
#[serde(transparent)]
pub struct LocationId(Uuid);

impl From<Uuid> for ActivityId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for ActivityId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<ActivityId> for Uuid {
    fn from(activity_id: ActivityId) -> Self {
        activity_id.0
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

#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Activity<T>
where
    T: Validate,
{
    pub(crate) id: ActivityId,
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
#[validate(schema(function = "validate_activity"))]
pub(crate) struct ActivityContent {
    pub(crate) location_id: LocationId,
    pub(crate) is_hidden: bool,
    pub(crate) allow_guest_signup: bool,
    #[validate(length(min = 1, max = 100))]
    pub(crate) name: String,
    #[validate(length(min = 1, max = 5000))]
    pub(crate) description: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) start_time: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) end_time: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) registration_start: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) registration_end: OffsetDateTime,
}

fn validate_activity(activity: &ActivityContent) -> Result<(), ValidationError> {
    if activity.start_time > activity.end_time {
        Err(ValidationError::new("date").with_message(Cow::Borrowed("Start cannot be after end")))
    } else if activity.registration_start > activity.registration_end {
        Err(ValidationError::new("date").with_message(Cow::Borrowed(
            "registration start cannot be later than registration end",
        )))
    } else {
        Ok(())
    }
}

#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub(crate) struct ActivityContentHydrated {
    pub(crate) location_id: LocationId,
    pub(crate) is_hidden: bool,
    pub(crate) allow_guest_signup: bool,
    #[validate(length(min = 1, max = 100))]
    pub(crate) name: String,
    #[validate(length(min = 1, max = 5000))]
    pub(crate) description: Option<String>,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) start_time: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) end_time: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) registration_start: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub(crate) registration_end: OffsetDateTime,
    pub registrations: Vec<BasicUser>,
}
