use crate::{
    auth::role::MembershipStatus, error::Error, file::FileId, user::BasicUser,
    wire::location::Location,
};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use std::{borrow::Cow, ops::Deref, str::FromStr};
use strum_macros::IntoStaticStr;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(transparent)]
pub struct ActivityId(Uuid);
#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
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

#[derive(sqlx::Type, Serialize, Deserialize, Debug, Clone, Copy, IntoStaticStr)]
#[serde(rename_all = "camelCase")]
pub enum ActivityType {
    Activity,
    Course,
    Weekend,
    Training,
}

impl FromStr for ActivityType {
    // TODO proper error
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(match s.to_lowercase().as_str() {
            "activity" => ActivityType::Activity,
            "course" => ActivityType::Course,
            "weekend" => ActivityType::Weekend,
            "training" => ActivityType::Training,
            _ => {
                return Err(Error::Other(format!(
                    "Invalid activity type {s}: Must be one of activity, course, or weekend"
                )))
            }
        })
    }
}

#[skip_serializing_none]
#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Activity<T>
where
    T: Validate,
{
    pub id: ActivityId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
    pub registration_count: i64,
    pub waiting_list_count: i64,
    #[serde(flatten)]
    #[validate(nested)]
    pub content: ActivityContent<T>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
#[validate(schema(function = "validate_activity"))]
pub struct ActivityContent<T>
where
    T: Validate,
{
    #[validate(length(min = 1, max = 100))]
    pub name_nl: String,
    #[validate(length(min = 1, max = 100))]
    pub name_en: String,
    pub image: Option<FileId>,
    #[validate(length(min = 1, max = 50000))]
    pub description_nl: Option<String>,
    #[validate(length(min = 1, max = 50000))]
    pub description_en: Option<String>,
    #[validate(nested)]
    pub dates: Vec<Date>,
    #[serde(with = "time::serde::rfc3339")]
    pub registration_start: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub registration_end: OffsetDateTime,
    #[validate(range(min = 0, max = 999, message = "Maximum registrations is 999"))]
    pub registration_max: Option<i32>,
    #[validate(range(min = 0, max = 999, message = "Maximum waiting list is 999"))]
    pub waiting_list_max: Option<i32>,
    pub is_published: bool,
    pub required_membership_status: Option<Vec<MembershipStatus>>,
    pub activity_type: ActivityType,
    pub questions: Vec<Question>,
    pub metadata: serde_json::Value,
    #[serde(flatten)]
    #[validate(nested)]
    pub(crate) details: T,
}
#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Hydrated {
    pub location: Location,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct IdOnly {
    pub location_id: LocationId,
}

#[derive(Serialize, Deserialize, Debug, Validate)]
#[validate(schema(function = "validate_date"))]
#[serde(rename_all = "camelCase")]
pub struct Date {
    #[serde(with = "time::serde::rfc3339")]
    pub start: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub end: OffsetDateTime,
}

fn validate_date(activity: &Date) -> Result<(), ValidationError> {
    if activity.start > activity.end {
        Err(ValidationError::new("date").with_message(Cow::Borrowed("Start cannot be after end")))
    } else {
        Ok(())
    }
}

fn validate_activity<T: Validate>(activity: &ActivityContent<T>) -> Result<(), ValidationError> {
    if activity.registration_start > activity.registration_end {
        Err(ValidationError::new("date").with_message(Cow::Borrowed(
            "registration start cannot be later than registration end",
        )))
    } else {
        Ok(())
    }
}

#[skip_serializing_none]
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Registration {
    #[serde(flatten)]
    pub user: BasicUser,
    pub attended: Option<bool>,
    pub waiting_list_position: Option<i32>,
    pub answers: Vec<Answer>,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
}

#[derive(Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct NewRegistration {
    pub answers: Vec<Answer>,
    pub attended: Option<bool>,
    pub waiting_list_position: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Answer {
    pub question_id: Uuid,
    pub answer: String,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: Uuid,
    pub question_nl: String,
    pub question_en: String,
    pub question_type: QuestionType,
    pub required: bool,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub enum QuestionType {
    ShortText,
    LongText,
    Number,
    Time,
    MultipleChoice(Vec<String>),
}
