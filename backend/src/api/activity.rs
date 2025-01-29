use crate::activity::{Activity, ActivityContent, Answer, Hydrated, IdOnly, NewRegistration, Question, Registration};
use crate::api::ValidatedJson;
use crate::auth::role::Role;
use crate::error::{AppResult, Error};
use crate::user::UserId;
use crate::{
    api::ApiResult, auth::session::Session, data_source::activity::ActivityStore,
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
    ValidatedJson(new): ValidatedJson<NewRegistration>,
) -> ApiResult<Registration> {
    let activity = store.get_activity_hydrated(activity_id).await?;
    
    let waiting_list_pos = if update_all_full_activity_access(&session).is_ok() {
        // TODO does not allow to force someone on the wait list
        None
    } else if update_single_full_registration_access(&user_id, &session).is_ok() {
        if activity.content.registration_end < OffsetDateTime::now_utc() {
            Err(Error::BadRequest(
                "Registration deadline has already passed",
            ))?
        }
        if let Some(waiting_list_max) = activity.content.waiting_list_max {
            if waiting_list_max <= activity.waiting_list_count as i32 {
                Err(Error::BadRequest(
                    "Registrations and waiting list are already full",
                ))?
            } else {
                Some((activity.waiting_list_count + 1) as i32)
            }
        } else if let Some(registration_max) = activity.content.registration_max {
            if registration_max <= activity.registration_count as i32 {
                Some(1)
            } else {
                None
            }
        } else {
            None
        }
    } else {
        Err(Error::Unauthorized)?
    };
    
    if !check_required_questions_answered(&activity.content.questions, &new.answers){
        Err(Error::BadRequest("Missing answer for required question"))?
    };

    Ok(Json(
        store
            .new_registration(activity_id, user_id, waiting_list_pos, new)
            .await?,
    ))
}

fn check_required_questions_answered(questions: &[Question], answers: &[Answer]) -> bool {
    for question in questions {
        if question.required && !answers.iter().any(|a| a.question_id == question.id){
            return false
        }
    }
    true
}