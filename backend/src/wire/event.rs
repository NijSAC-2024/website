use crate::{Language, auth::role::MembershipStatus, error::Error, file::FileId, user::BasicUser};
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use std::{borrow::Cow, ops::Deref, str::FromStr};
use strum_macros::IntoStaticStr;
use time::OffsetDateTime;
use uuid::Uuid;
use validator::{Validate, ValidationError};

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone)]
#[serde(transparent)]
pub struct EventId(Uuid);

impl From<Uuid> for EventId {
    fn from(id: Uuid) -> Self {
        Self(id)
    }
}

impl Deref for EventId {
    type Target = Uuid;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl From<EventId> for Uuid {
    fn from(event_id: EventId) -> Self {
        event_id.0
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
                    "Invalid event type {s}: Must be one of event, course, weekend, or training"
                )));
            }
        })
    }
}

#[skip_serializing_none]
#[derive(Serialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Event<T>
where
    T: Validate,
{
    pub id: EventId,
    #[serde(with = "time::serde::rfc3339")]
    pub created: OffsetDateTime,
    #[serde(with = "time::serde::rfc3339")]
    pub updated: OffsetDateTime,
    pub registration_count: i64,
    pub waiting_list_count: i64,
    #[serde(flatten)]
    #[validate(nested)]
    pub content: EventContent<T>,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct EventContent<T> {
    #[validate(nested)]
    pub name: Language,
    pub image: Option<FileId>,
    #[validate(nested)]
    #[serde(default)]
    pub description: Language,
    #[validate(nested)]
    pub dates: Vec<Date>,
    pub registration_period: Option<Date>,
    #[validate(range(min = 0, max = 999, message = "Maximum registrations is 999"))]
    pub registration_max: Option<i32>,
    #[validate(range(min = 0, max = 999, message = "Maximum waiting list is 999"))]
    pub waiting_list_max: Option<i32>,
    pub is_published: bool,
    pub required_membership_status: Vec<MembershipStatus>,
    pub event_type: ActivityType,
    #[validate[nested]]
    pub questions: Vec<Question>,
    #[serde(default)]
    pub metadata: serde_json::Value,
    pub location: T,
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

fn validate_date(event: &Date) -> Result<(), ValidationError> {
    if event.start > event.end {
        Err(ValidationError::new("date").with_message(Cow::Borrowed("Start cannot be after end")))
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

#[derive(Serialize, Deserialize, Debug, Validate)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: Uuid,
    #[validate(nested)]
    pub question: Language,
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
