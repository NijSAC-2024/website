use crate::{
    api::{ApiResult, ValidatedJson},
    auth::{
        role::{MembershipStatus, Role},
        session::Session,
    },
    data_source::event::EventStore,
    error::{AppResult, Error},
    event::{
        Answer, Date, Event, EventContent, NewRegistration, Question, Registration, RegistrationId,
    },
    location::{Location, LocationId},
    user::UserId,
    wire::event::EventId,
};
use axum::{Json, extract::Path};
use time::OffsetDateTime;
use tracing::{debug, info, trace, warn};

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

pub async fn get_user_registrations(
    store: EventStore,
    Path(id): Path<UserId>,
    session: Session,
) -> ApiResult<Vec<Registration>> {
    if update_single_full_registration_access(&id, &session).is_ok() {
        Ok(Json(store.get_user_registrations(session.user_id()).await?))
    } else {
        Err(Error::Unauthorized)
    }
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights, one can see hidden activities.
pub async fn get_event(
    store: EventStore,
    Path(id): Path<EventId>,
    session: Option<Session>,
) -> ApiResult<Event<Location>> {
    if let Some(session) = session
        && update_all_full_event_access(&session).is_ok()
    {
        return Ok(Json(store.get_event(&id, true).await?));
    }

    Ok(Json(store.get_event(&id, false).await?))
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights, one can see hidden activities.
pub async fn get_activities(
    store: EventStore,
    session: Option<Session>,
) -> ApiResult<Vec<Event<Location>>> {
    if let Some(session) = session
        && update_all_full_event_access(&session).is_ok()
    {
        return Ok(Json(store.get_events(true).await?));
    }
    Ok(Json(store.get_events(false).await?))
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
    Path((_event_id, registration_id)): Path<(EventId, RegistrationId)>,
) -> ApiResult<Registration> {
    let registration = store.get_registration(&registration_id).await?;

    if let Some(ref user) = registration.user {
        update_single_full_registration_access(&user.user_id, &session)?;
    } else {
        update_all_full_event_access(&session)?;
    }

    Ok(Json(registration))
}

pub async fn create_registration(
    store: EventStore,
    session: Option<Session>,
    Path(event_id): Path<EventId>,
    ValidatedJson(mut new): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    let user_id = new.user_id.clone();
    let event = store.get_event(&event_id, true).await?;

    if let Some(ref user_id) = user_id {
        let Some(ref session) = session else {
            info!(
                user_id = user_id.to_string(),
                "Tried to register with user ID while not logged in"
            );
            return Err(Error::Unauthorized);
        };
        update_single_full_registration_access(user_id, session).inspect_err(|_| {
            info!(
                user_id = user_id.to_string(),
                logged_in_user = session.user_id().to_string(),
                event_id = event.id.to_string(),
                "logged in user does not have permission to update this registration"
            )
        })?;
    } else if !event
        .content
        .required_membership_status
        .contains(&MembershipStatus::NonMember)
    {
        info!(
            event_id = event.id.to_string(),
            "Cannot sign up for an event that does not accept NonMembers"
        );
        return Err(Error::Unauthorized);
    }

    if event.content.registration_period.is_none() {
        let Some(ref session) = session else {
            // For anonymous registrations
            debug!(
                event_id = event.id.to_string(),
                "Registrations are not open"
            );
            return Err(Error::BadRequest("Registrations are not open"));
        };
        if update_all_full_event_access(session).is_err() {
            // For regular users
            debug!(
                event_id = event.id.to_string(),
                "Registrations are not open"
            );
            Err(Error::BadRequest("Registrations are not open"))?
        }
    }

    if let Some(ref session) = session {
        if update_all_full_event_access(session).is_err() {
            ensure_signup_has_not_passed(&event)?;
        }
    } else {
        ensure_signup_has_not_passed(&event)?;
    };

    ensure_correct_waiting_list_position(&event, &mut new, session.as_ref(), None)?;
    trace!(
        event_id = event.id.to_string(),
        "Calculated waiting list position {:?}", new.waiting_list_position
    );

    if !check_required_questions_answered(&event.content.questions, &new.answers) {
        Err(Error::BadRequest("Missing answer for required question"))?
    };

    Ok(Json(store.new_registration(&event_id, user_id, new).await?))
}

pub async fn update_registration(
    store: EventStore,
    session: Session,
    Path((_event_id, registration_id)): Path<(EventId, RegistrationId)>,
    ValidatedJson(mut updated): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    let registration = store.get_registration(&registration_id).await?;

    if update_all_full_event_access(&session).is_err() {
        let Some(user_id) = registration.user.as_ref().map(|u| u.user_id.clone()) else {
            return Err(Error::BadRequest(
                "Only admins can update anonymous sign-ups",
            ));
        };

        update_single_full_registration_access(&user_id, &session)?;
    }

    let event = store.get_event(&registration.event_id, true).await?;

    ensure_signup_has_not_passed(&event)?;
    ensure_correct_waiting_list_position(
        &event,
        &mut updated,
        Some(&session),
        Some(&registration),
    )?;
    ensure_attendance_update_full_access_only(&registration, &mut updated, &session);

    Ok(Json(
        store.update_registration(&registration_id, updated).await?,
    ))
}

pub async fn delete_registration(
    store: EventStore,
    session: Session,
    Path((_event_id, registration_id)): Path<(EventId, RegistrationId)>,
) -> AppResult<()> {
    if update_all_full_event_access(&session).is_ok() {
        store.delete_registration(&registration_id).await
    } else {
        let registration = store.get_registration(&registration_id).await?;
        if let Some(user) = registration.user {
            // Normal users can only delete their own registration
            update_single_full_registration_access(&user.user_id, &session)?
        } else {
            // Anonymous registrations can only be modified by admins
            return Err(Error::Unauthorized);
        };
        let event = store.get_event(&registration.event_id, true).await?;
        ensure_signup_has_not_passed(&event)?;
        store.delete_registration(&registration_id).await
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

fn ensure_signup_has_not_passed(event: &Event<Location>) -> Result<(), Error> {
    if let Some(Date { end, .. }) = event.content.registration_period
        && end < OffsetDateTime::now_utc()
    {
        return Err(Error::BadRequest(
            "Registration deadline has already passed",
        ));
    };
    Ok(())
}

/// Depending on access rights, it allows overwriting the waiting list position
/// Additionally, it ensures that only valid positions are accepted.
fn ensure_correct_waiting_list_position(
    event: &Event<Location>,
    new_registration: &mut NewRegistration,
    session: Option<&Session>,
    current_registration: Option<&Registration>,
) -> Result<(), Error> {
    if let Some(session) = session
        && update_all_full_event_access(session).is_ok()
    {
        trace!("logged in user has admin access to the waiting list");
        if new_registration.waiting_list_position.is_some() {
            trace!(
                event_id = event.id.to_string(),
                new_waiting_list_position = new_registration.waiting_list_position,
                "explicitly setting the waiting list position requested"
            );
            let mut valid_pos = false;
            if new_registration.waiting_list_position == Some(event.waiting_list_count as i32) {
                valid_pos = true
            }
            if let Some(current_registration) = current_registration
                && current_registration.waiting_list_position
                    == new_registration.waiting_list_position
            {
                valid_pos = true
            }
            if !valid_pos {
                warn!(
                    event_id = event.id.to_string(),
                    new_waiting_list_position = new_registration.waiting_list_position,
                    "Determined the requested waiting list position is invalid"
                );
                Err(Error::BadRequest("Invalid waiting list position"))?
            }
        }
    } else if let Some(registration) = current_registration {
        trace!(
            event_id = event.id.to_string(),
            "No admin access to waiting list, overriding with exising waiting list position"
        );
        new_registration.waiting_list_position = registration.waiting_list_position
    } else if let Some(registration_max) = event.content.registration_max {
        trace!(
            event_id = event.id.to_string(),
            "New registration without admin access"
        );
        if registration_max <= event.registration_count as i32 {
            trace!("Registrations are full, adding to waiting list");

            if let Some(waiting_list_max) = event.content.waiting_list_max
                && waiting_list_max <= event.waiting_list_count as i32
            {
                Err(Error::BadRequest(
                    "Registrations and waiting list are already full",
                ))?
            }
            trace!("Waiting list position is {}", event.waiting_list_count);
            new_registration.waiting_list_position = Some(event.waiting_list_count as i32);

            new_registration.waiting_list_position = Some(0)
        } else {
            trace!("Still spots available, setting waiting list position to None");
            new_registration.waiting_list_position = None
        }
    } else {
        trace!("No limit to the registrations, setting waiting list position to None");
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
