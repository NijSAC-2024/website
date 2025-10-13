use crate::{
    api::{
        create_event, create_registration, delete_event, delete_registration, delete_user,
        get_activities, get_all_users, get_event, get_event_registrations, get_user_committees, get_material_list,
        get_registration, get_user_materials, register, update_event, update_pwd,
        update_registration, update_user, update_user_material, who_am_i, get_committees, 
        get_committee, create_committee, update_committee, delete_committee, add_user_to_committee, 
        remove_user_from_committee, get_committee_members, create_location, delete_location, 
        get_file_content, get_file_metadata, get_files, get_location, update_location, upload,
        get_locations, get_user, get_user_registrations, location_used_by, get_user_events
    },
    auth::{login, logout},
    state::AppState,
};
use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, State},
    routing::{get, post, put},
};
// use memory_serve::{MemoryServe, load_assets};
use tower_http::{trace, trace::TraceLayer};
use tracing::Level;

pub fn create_router(state: AppState) -> Router {
    // let memory_router = MemoryServe::new(load_assets!("../frontend/dist"))
    //     .index_file(Some("/index.html"))
    //     .into_router();

    Router::new()
        // .merge(memory_router)
        .nest("/api", api_router())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(trace::DefaultMakeSpan::new().level(Level::TRACE))
                .on_response(trace::DefaultOnResponse::new().level(Level::TRACE)),
        )
        .with_state(state)
}

fn api_router() -> Router<AppState> {
    Router::new()
        .route("/version", get(version))
        .route("/whoami", get(who_am_i))
        .route("/login", post(login))
        .route("/logout", get(logout))
        .route("/register", post(register))
        // The `POST /file` endpoint has a size limit of 50 MB,
        // instead of the default 2MB other endpoints have
        .route("/file", post(upload).layer(DefaultBodyLimit::max(52428800)))
        .route("/file", get(get_files))
        .route("/file/{:id}", get(get_file_content))
        .route("/file/{:id}/metadata", get(get_file_metadata))
        .route("/user", get(get_all_users))
        .route(
            "/user/{:id}",
            get(get_user).put(update_user).delete(delete_user),
        )
        .route("/user/{:id}/password", post(update_pwd))
        .route(
            "/user/{:id}/event_registrations",
            get(get_user_registrations),
        )
        .route("/user/{:id}/events", get(get_user_events))
        .route("/user/{:id}/committees", get(get_user_committees))
        .route("/user/{:id}/material", get(get_material_list))
        .route("/user/{:id}/getMaterial", get(get_user_materials))
        .route("/user/{:id}/material/update", put(update_user_material))
        .route("/event", get(get_activities).post(create_event))
        .route(
            "/event/{:id}",
            get(get_event).put(update_event).delete(delete_event),
        )
        .route(
            "/event/{:event_id}/registration",
            get(get_event_registrations).post(create_registration),
        )
        .route(
            "/event/{:event_id}/registration/{:registration_id}",
            get(get_registration)
                .put(update_registration)
                .delete(delete_registration),
        )
        .route("/location", get(get_locations).post(create_location))
        .route(
            "/location/{:id}",
            get(get_location)
                .put(update_location)
                .delete(delete_location),
        )
        .route("/location/{:id}/used_by", get(location_used_by))
        .route("/committee", get(get_committees).post(create_committee))
        .route(
            "/committee/{:id}",
            get(get_committee).put(update_committee).delete(delete_committee),
        )
        .route(
            "/committee/{:id}/user/{:user_id}",
            post(add_user_to_committee).delete(remove_user_from_committee),
        )
        .route(
            "/committee/{:id}/members",
            get(get_committee_members),
        )
}

async fn version(State(state): State<AppState>) -> Json<String> {
    Json(state.config().version.clone())
}
