use crate::{
    AppResult,
    api::{ApiResult, IntoApiResult, ValidatedJson, conditional_json_response, is_admin_or_board},
    auth::{
        role::{Membership, Status},
        session::Session,
    },
    data_source::event::EventStore,
    error::Error,
    event::{
        Answer, Date, Event, EventContent, NewRegistration, Question, Registration, RegistrationId,
    },
    location::{Location, LocationId},
    user::UserId,
    wire::event::EventId,
};
use axum::{extract::Path, http::HeaderMap};
use time::OffsetDateTime;
use tracing::{trace, warn};
use uuid::Uuid;

pub async fn get_event_registrations(
    store: EventStore,
    Path(id): Path<EventId>,
    session: Option<Session>,
    headers: HeaderMap,
) -> ApiResult {
    let event: Event<Location> = store.get_event(&id, true).await?;

    // Admins/board → detailed
    if let Some(ref session) = session
        && is_admin_or_board(session).is_ok()
    {
        let regs = store.get_registrations_detailed(&id).await?;
        return conditional_json_response(&headers, &regs);
    }

    let worga_user = event
        .content
        .metadata
        .get("worga")
        .and_then(|v| v.as_str())
        .and_then(|s| Uuid::parse_str(s).ok());

    // worga user → detailed
    if let (Some(session), Some(worga_uuid)) = (&session, worga_user)
        && **session.user_id() == worga_uuid
    {
        let regs = store.get_registrations_detailed(&id).await?;
        return conditional_json_response(&headers, &regs);
    }

    // Committee member → detailed
    if let Some(session) = &session
        && store
            .ensure_user_in_committee(session, &event.content.created_by)
            .await
            .is_ok()
    {
        let regs = store.get_registrations_detailed(&id).await?;
        return conditional_json_response(&headers, &regs);
    }

    // Public if NonMember accepted
    if event
        .content
        .required_membership
        .contains(&Membership::NonMember)
    {
        let regs = store.get_registrations(&id).await?;
        return conditional_json_response(&headers, &regs);
    }

    // Summary for matching membership
    if let Some(session) = &session
        && event
            .content
            .required_membership
            .contains(&session.membership())
        && session.status() == Status::Accepted
    {
        let regs = store.get_registrations(&id).await?;
        return conditional_json_response(&headers, &regs);
    }

    Err(Error::Unauthorized)
}

pub async fn get_user_registrations(
    store: EventStore,
    Path(id): Path<UserId>,
    session: Session,
    headers: HeaderMap,
) -> ApiResult {
    has_registration_access(&store, &id, &session, None).await?;
    let registrations = store.get_user_registrations(&id).await?;
    conditional_json_response(&headers, &registrations)
}

pub async fn get_user_events(
    store: EventStore,
    Path(id): Path<UserId>,
    session: Session,
    headers: HeaderMap,
) -> ApiResult {
    if session.is_member() {
        let events = store.get_user_events(&id).await?;
        conditional_json_response(&headers, &events)
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
    headers: HeaderMap,
) -> ApiResult {
    if let Some(session) = session
        && is_admin_or_board(&session).is_ok()
    {
        let event = store.get_event(&id, true).await?;
        conditional_json_response(&headers, &event)
    } else {
        let event = store.get_event(&id, false).await?;
        conditional_json_response(&headers, &event)
    }
}

/// Partially public endpoint, no login required.
/// If logged in with sufficient rights, one can see hidden activities.
pub async fn get_events(
    store: EventStore,
    session: Option<Session>,
    headers: HeaderMap,
) -> ApiResult {
    if let Some(session) = session
        && is_admin_or_board(&session).is_ok()
    {
        let events = store.get_events(true).await?;
        conditional_json_response(&headers, &events)
    } else {
        let events = store.get_events(false).await?;
        conditional_json_response(&headers, &events)
    }
}

pub async fn create_event(
    store: EventStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<EventContent<LocationId>>,
) -> ApiResult {
    store
        .ensure_user_in_committee(&session, &new.created_by)
        .await?;
    store.create_event(new).await.into_api()
}

pub async fn update_event(
    store: EventStore,
    session: Session,
    Path(id): Path<EventId>,
    ValidatedJson(updated): ValidatedJson<EventContent<LocationId>>,
) -> ApiResult {
    store
        .ensure_user_in_committee(&session, &updated.created_by)
        .await?;
    store.update_event(&id, updated).await.into_api()
}

pub async fn delete_event(
    store: EventStore,
    session: Session,
    Path(id): Path<EventId>,
) -> ApiResult {
    let event: Event<Location> = store.get_event(&id, true).await?;
    store
        .ensure_user_in_committee(&session, &event.content.created_by)
        .await?;
    store.delete_event(&id).await.into_api()
}

pub async fn get_registration(
    store: EventStore,
    session: Session,
    Path((event_id, registration_id)): Path<(EventId, RegistrationId)>,
    headers: HeaderMap,
) -> ApiResult {
    let registration = store.get_registration(&registration_id).await?;

    if let Some(ref user_id) = registration.user_id {
        has_registration_access(&store, user_id, &session, Some(&event_id)).await?;
    }
    conditional_json_response(&headers, &registration)
}

pub async fn create_registration(
    store: EventStore,
    session: Option<Session>,
    Path(event_id): Path<EventId>,
    ValidatedJson(mut new): ValidatedJson<NewRegistration>,
) -> ApiResult {
    let user_id = new.user_id.clone();
    let event = store.get_event(&event_id, true).await?;

    if !check_required_questions_answered(&event.content.questions, &new.answers) {
        Err(Error::BadRequest("Missing answer for required question"))?
    };

    if let Some(session) = &session
        && (is_admin_or_board(session).is_ok()
            || store
                .ensure_user_is_committee_chair(session, &event.content.created_by)
                .await
                .is_ok())
    {
        return store
            .create_registration(&event_id, user_id, new)
            .await
            .into_api();
    }

    match (&new.user_id, &session) {
        (Some(user_id), Some(session)) => {
            if session.user_id() != user_id {
                return Err(Error::Unauthorized);
            }
            if new.guest_name.is_some() || new.guest_email.is_some() {
                return Err(Error::BadRequest(
                    "User registrations cannot contain guest info",
                ));
            }
        }
        (Some(_), None) => {
            return Err(Error::Unauthorized);
        }
        (None, _) => {
            if new.guest_name.is_none() || new.guest_email.is_none() {
                return Err(Error::BadRequest("Missing guest name or email"));
            }
        }
    }

    ensure_is_open(&event)?;

    ensure_required_membership(&event, session.as_ref())?;

    ensure_correct_waiting_list_position(&store, &event, &mut new, session.as_ref(), None).await?;

    store
        .create_registration(&event_id, user_id, new)
        .await
        .into_api()
}

pub async fn update_registration(
    store: EventStore,
    session: Session,
    Path((event_id, registration_id)): Path<(EventId, RegistrationId)>,
    ValidatedJson(mut updated): ValidatedJson<NewRegistration>,
) -> ApiResult {
    let registration = store.get_registration(&registration_id).await?;

    if is_admin_or_board(&session).is_err() {
        let Some(user_id) = &registration.user_id else {
            return Err(Error::BadRequest(
                "Only admins can update anonymous sign-ups",
            ));
        };

        has_registration_access(&store, user_id, &session, Some(&event_id)).await?;
    }

    let event = store.get_event(&registration.event_id, true).await?;

    if !(is_admin_or_board(&session).is_ok()
        || store
            .ensure_user_is_committee_chair(&session, &event.content.created_by)
            .await
            .is_ok())
    {
        ensure_is_open(&event)?;
    }

    updated.user_id = registration.user_id.clone();

    ensure_correct_waiting_list_position(
        &store,
        &event,
        &mut updated,
        Some(&session),
        Some(&registration),
    )
    .await?;

    store
        .update_registration(&registration_id, updated)
        .await
        .into_api()
}

pub async fn delete_registration(
    store: EventStore,
    session: Session,
    Path((event_id, registration_id)): Path<(EventId, RegistrationId)>,
) -> ApiResult {
    if is_admin_or_board(&session).is_ok() {
        store.delete_registration(&registration_id).await.into_api()
    } else {
        let registration = store.get_registration(&registration_id).await?;
        if let Some(user_id) = registration.user_id {
            // Normal users can only delete their own registration
            has_registration_access(&store, &user_id, &session, Some(&event_id)).await?;
        } else {
            // Anonymous registrations can only be modified by admins
            return Err(Error::Unauthorized);
        };
        let event = store.get_event(&registration.event_id, true).await?;
        if store
            .ensure_user_is_committee_chair(&session, &event.content.created_by)
            .await
            .is_err()
        {
            ensure_is_open(&event)?;
        }
        store.delete_registration(&registration_id).await.into_api()
    }
}

async fn has_registration_access(
    store: &EventStore,
    user_id: &UserId,
    session: &Session,
    event_id: Option<&EventId>,
) -> AppResult<()> {
    if is_admin_or_board(session).is_ok() || user_id == session.user_id() {
        return Ok(());
    }

    if let Some(event_id) = event_id {
        let event: Event<Location> = store.get_event(event_id, true).await?;
        if store
            .ensure_user_is_committee_chair(session, &event.content.created_by)
            .await
            .is_ok()
        {
            return Ok(());
        }
    }

    Err(Error::Unauthorized)
}

fn check_required_questions_answered(questions: &[Question], answers: &[Answer]) -> bool {
    for question in questions {
        if question.required && !answers.iter().any(|a| a.question_id == question.id) {
            return false;
        }
    }
    true
}

fn ensure_is_open(event: &Event<Location>) -> AppResult<()> {
    if let Some(Date { start, end }) = event.content.registration_period
        && end < OffsetDateTime::now_utc()
        && start > OffsetDateTime::now_utc()
    {
        return Err(Error::BadRequest("Registrations are not open."));
    };
    Ok(())
}

fn ensure_required_membership(event: &Event<Location>, session: Option<&Session>) -> AppResult<()> {
    if event
        .content
        .required_membership
        .contains(&Membership::NonMember)
    {
        return Ok(());
    };
    if let Some(session) = session
        && event
            .content
            .required_membership
            .contains(&session.membership())
    {
        return Ok(());
    }
    Err(Error::BadRequest(
        "You do not meet the membership requirements for this event.",
    ))
}

/// Depending on access rights, it allows overwriting the waiting list position
/// Additionally, it ensures that only valid positions are accepted.
async fn ensure_correct_waiting_list_position(
    store: &EventStore,
    event: &Event<Location>,
    new_registration: &mut NewRegistration,
    session: Option<&Session>,
    current_registration: Option<&Registration>,
) -> AppResult<()> {
    if let Some(session) = session
        && (is_admin_or_board(session).is_ok()
            || store
                .ensure_user_is_committee_chair(session, &event.content.created_by)
                .await
                .is_ok())
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
            new_registration.waiting_list_position = Some(event.waiting_list_count as i32)
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
