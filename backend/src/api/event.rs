use crate::{
    event::{Event, EventContent, Answer, Date, NewRegistration, Question, Registration},
    api::{ApiResult, ValidatedJson},
    auth::{role::Role, session::Session},
    data_source::event::EventStore,
    error::{AppResult, Error},
    location::{Location, LocationId},
    user::UserId,
    wire::event::EventId,
};
use axum::{extract::Path, Json};
use time::OffsetDateTime;

fn update_all_full_event_access(session: &Session) -> AppResult<()> {
    if session.membership_status().is_member()
        && session.roles().iter().any(|role| {
            matches!(
                role,
                Role::Admin
                    | Role::Treasurer
                    | Role::Secretary
                    | Role::Chair
                    | Role::ViceChair
                    | Role::ClimbingCommissar
                    | Role::ActivityCommissionMember
            )
        })
    {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn update_single_full_registration_access(id: &UserId, session: &Session) -> AppResult<()> {
    if update_all_full_event_access(session).is_ok() || id == session.user_id() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn read_all_basic_registrations_access(session: &Session) -> AppResult<()> {
    if update_all_full_event_access(session).is_ok() || session.membership_status().is_member() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_event_registrations(
    store: EventStore,
    Path(id): Path<EventId>,
    session: Session,
) -> ApiResult<serde_json::Value> {
    let res = if update_all_full_event_access(&session).is_ok() {
        serde_json::to_value(store.get_registrations_detailed(&id).await?)?
    } else if read_all_basic_registrations_access(&session).is_ok() {
        serde_json::to_value(store.get_registered_users(&id).await?)?
    } else {
        Err(Error::Unauthorized)?
    };

    Ok(Json(res))
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights, one can see hidden activities.
pub async fn get_event(
    store: EventStore,
    Path(id): Path<EventId>,
    session: Option<Session>,
) -> ApiResult<Event<Location>> {
    if let Some(session) = session {
        if update_all_full_event_access(&session).is_ok() {
            return Ok(Json(store.get_event_hydrated(&id, true).await?));
        }
    }
    Ok(Json(store.get_event_hydrated(&id, false).await?))
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights, one can see hidden activities.
pub async fn get_activities(
    store: EventStore,
    session: Option<Session>,
) -> ApiResult<Vec<Event<Location>>> {
    if let Some(session) = session {
        if update_all_full_event_access(&session).is_ok() {
            return Ok(Json(store.get_activities(true).await?));
        }
    }
    Ok(Json(store.get_activities(false).await?))
}

pub async fn create_event(
    store: EventStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<EventContent<LocationId>>,
) -> ApiResult<Event<Location>> {
    update_all_full_event_access(&session)?;
    Ok(Json(store.new_event(new, session.user_id()).await?))
}

pub async fn update_event(
    store: EventStore,
    session: Session,
    Path(id): Path<EventId>,
    ValidatedJson(updated): ValidatedJson<EventContent<LocationId>>,
) -> ApiResult<Event<Location>> {
    update_all_full_event_access(&session)?;
    Ok(Json(store.update_event(&id, updated).await?))
}

pub async fn delete_event(
    store: EventStore,
    session: Session,
    Path(id): Path<EventId>,
) -> AppResult<()> {
    update_all_full_event_access(&session)?;
    store.delete_event(&id).await
}

pub async fn get_registration(
    store: EventStore,
    session: Session,
    Path((event_id, user_id)): Path<(EventId, UserId)>,
) -> ApiResult<Registration> {
    update_single_full_registration_access(&user_id, &session)?;
    Ok(Json(store.get_registration(&event_id, &user_id).await?))
}

pub async fn create_registration(
    store: EventStore,
    session: Session,
    Path((event_id, user_id)): Path<(EventId, UserId)>,
    ValidatedJson(mut new): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    update_single_full_registration_access(&user_id, &session)?;

    let event = store.get_event_hydrated(&event_id, true).await?;
    if update_all_full_event_access(&session).is_err()
        && event.content.registration_period.is_none()
    {
        Err(Error::BadRequest("Registrations are not open"))?
    }

    if update_all_full_event_access(&session).is_err() {
        if let Some(Date { end, .. }) = event.content.registration_period {
            if end < OffsetDateTime::now_utc() {
                Err(Error::BadRequest(
                    "Registration deadline has already passed",
                ))?
            }
        }
    }

    ensure_correct_waiting_list_position(&event, &mut new, &session, None)?;

    if !check_required_questions_answered(&event.content.questions, &new.answers) {
        Err(Error::BadRequest("Missing answer for required question"))?
    };

    Ok(Json(
        store.new_registration(&event_id, &user_id, new).await?,
    ))
}

pub async fn update_registration(
    store: EventStore,
    session: Session,
    Path((event_id, user_id)): Path<(EventId, UserId)>,
    ValidatedJson(mut updated): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    update_single_full_registration_access(&user_id, &session)?;

    let event = store.get_event_hydrated(&event_id, true).await?;
    let registration = store.get_registration(&event_id, &user_id).await?;

    ensure_correct_waiting_list_position(&event, &mut updated, &session, Some(&registration))?;
    ensure_attendance_update_full_access_only(&registration, &mut updated, &session);

    Ok(Json(
        store
            .update_registration(&event_id, &user_id, updated)
            .await?,
    ))
}

pub async fn delete_registration(
    store: EventStore,
    session: Session,
    Path((event_id, user_id)): Path<(EventId, UserId)>,
) -> AppResult<()> {
    if update_all_full_event_access(&session).is_ok()
        || update_single_full_registration_access(&user_id, &session).is_ok()
    {
        store.delete_registration(&event_id, &user_id).await
    } else {
        Err(Error::Unauthorized)
    }
}

fn check_required_questions_answered(questions: &[Question], answers: &[Answer]) -> bool {
    for question in questions {
        if question.required && !answers.iter().any(|a| a.question_id == question.id) {
            return false;
        }
    }
    true
}

/// Depending on access rights, it allows overwriting the waiting list position
/// Additionally, it ensures that only valid positions are accepted.
fn ensure_correct_waiting_list_position(
    event: &Event<Location>,
    new_registration: &mut NewRegistration,
    session: &Session,
    current_registration: Option<&Registration>,
) -> Result<(), Error> {
    if update_all_full_event_access(session).is_ok() {
        if new_registration.waiting_list_position.is_some() {
            let mut valid_pos = false;
            if new_registration.waiting_list_position == Some(event.waiting_list_count as i32) {
                valid_pos = true
            }
            if let Some(current_registration) = current_registration {
                if current_registration.waiting_list_position
                    == new_registration.waiting_list_position
                {
                    valid_pos = true
                }
            }
            if !valid_pos {
                Err(Error::BadRequest("Invalid waiting list position"))?
            }
        }
    } else if let Some(registration) = current_registration {
        new_registration.waiting_list_position = registration.waiting_list_position
    } else if let Some(waiting_list_max) = event.content.waiting_list_max {
        if waiting_list_max <= event.waiting_list_count as i32 {
            Err(Error::BadRequest(
                "Registrations and waiting list are already full",
            ))?
        } else {
            new_registration.waiting_list_position = Some(event.waiting_list_count as i32)
        }
    } else if let Some(registration_max) = event.content.registration_max {
        if registration_max <= event.registration_count as i32 {
            new_registration.waiting_list_position = Some(0)
        } else {
            new_registration.waiting_list_position = None
        }
    } else {
        new_registration.waiting_list_position = None
    };
    Ok(())
}

fn ensure_attendance_update_full_access_only(
    current_registration: &Registration,
    new_registration: &mut NewRegistration,
    session: &Session,
) {
    if update_all_full_event_access(session).is_err() {
        new_registration.attended = current_registration.attended
    }
}
