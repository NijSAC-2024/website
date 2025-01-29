use crate::{
    activity::{
        Activity, ActivityContent, Answer, Hydrated, IdOnly, NewRegistration, Question,
        Registration,
    },
    api::{ApiResult, ValidatedJson},
    auth::{role::Role, session::Session},
    data_source::activity::ActivityStore,
    error::{AppResult, Error},
    user::UserId,
    wire::activity::ActivityId,
};
use axum::{extract::Path, Json};
use time::OffsetDateTime;

fn update_all_full_activity_access(session: &Session) -> AppResult<()> {
    if session.membership_status().is_member()
        && session.roles().iter().any(|role| match role {
            Role::Admin
            | Role::Treasurer
            | Role::Secretary
            | Role::Chair
            | Role::ViceChair
            | Role::ClimbingCommissar => true,
            Role::ActivityCommissionMember => false,
        })
    {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn update_single_full_registration_access(id: &UserId, session: &Session) -> AppResult<()> {
    if update_all_full_activity_access(session).is_ok() || id == session.user_id() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

fn read_all_basic_registrations_access(session: &Session) -> AppResult<()> {
    if update_all_full_activity_access(session).is_ok() || session.membership_status().is_member() {
        Ok(())
    } else {
        Err(Error::Unauthorized)
    }
}

pub async fn get_activity_registrations(
    store: ActivityStore,
    Path(id): Path<ActivityId>,
    session: Session,
) -> ApiResult<serde_json::Value> {
    let res = if update_all_full_activity_access(&session).is_ok() {
        serde_json::to_value(store.get_registrations_detailed(id).await?)?
    } else if read_all_basic_registrations_access(&session).is_ok() {
        serde_json::to_value(store.get_registered_users(id).await?)?
    } else {
        Err(Error::Unauthorized)?
    };

    Ok(Json(res))
}

/// Public endpoint, no login required
pub async fn get_activity(
    store: ActivityStore,
    Path(id): Path<ActivityId>,
) -> ApiResult<Activity<Hydrated>> {
    Ok(Json(store.get_activity_hydrated(id).await?))
}

pub async fn create_activity(
    store: ActivityStore,
    session: Session,
    ValidatedJson(new): ValidatedJson<ActivityContent<IdOnly>>,
) -> ApiResult<Activity<Hydrated>> {
    update_all_full_activity_access(&session)?;
    Ok(Json(store.new_activity(new).await?))
}

pub async fn get_registration(
    store: ActivityStore,
    session: Session,
    Path((activity_id, user_id)): Path<(ActivityId, UserId)>,
) -> ApiResult<Registration> {
    update_single_full_registration_access(&user_id, &session)?;
    Ok(Json(store.get_registration(activity_id, user_id).await?))
}

pub async fn create_registration(
    store: ActivityStore,
    session: Session,
    Path((activity_id, user_id)): Path<(ActivityId, UserId)>,
    ValidatedJson(mut new): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    update_single_full_registration_access(&user_id, &session)?;

    let activity = store.get_activity_hydrated(activity_id).await?;
    if update_all_full_activity_access(&session).is_err()
        && activity.content.registration_end < OffsetDateTime::now_utc()
    {
        Err(Error::BadRequest(
            "Registration deadline has already passed",
        ))?
    }

    ensure_correct_waiting_list_position(&activity, &mut new, &session, None)?;

    if !check_required_questions_answered(&activity.content.questions, &new.answers) {
        Err(Error::BadRequest("Missing answer for required question"))?
    };

    Ok(Json(
        store.new_registration(activity_id, user_id, new).await?,
    ))
}

pub async fn update_registration(
    store: ActivityStore,
    session: Session,
    Path((activity_id, user_id)): Path<(ActivityId, UserId)>,
    ValidatedJson(mut updated): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    update_single_full_registration_access(&user_id, &session)?;

    let activity = store.get_activity_hydrated(activity_id).await?;
    let registration = store.get_registration(activity_id, user_id).await?;

    ensure_correct_waiting_list_position(&activity, &mut updated, &session, Some(&registration))?;
    ensure_attendance_update_full_access_only(&registration, &mut updated, &session);

    Ok(Json(
        store
            .update_registration(activity_id, user_id, updated)
            .await?,
    ))
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
    activity: &Activity<Hydrated>,
    new_registration: &mut NewRegistration,
    session: &Session,
    current_registration: Option<&Registration>,
) -> Result<(), Error> {
    if update_all_full_activity_access(session).is_ok() {
        if new_registration.waiting_list_position.is_some() {
            let mut valid_pos = false;
            if new_registration.waiting_list_position == Some(activity.waiting_list_count as i32) {
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
    } else if let Some(waiting_list_max) = activity.content.waiting_list_max {
        if waiting_list_max <= activity.waiting_list_count as i32 {
            Err(Error::BadRequest(
                "Registrations and waiting list are already full",
            ))?
        } else {
            new_registration.waiting_list_position = Some(activity.waiting_list_count as i32)
        }
    } else if let Some(registration_max) = activity.content.registration_max {
        if registration_max <= activity.registration_count as i32 {
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
    if update_all_full_activity_access(session).is_err() {
        new_registration.attended = current_registration.attended
    }
}
