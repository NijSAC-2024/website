use crate::{
    api::{
        create_activity, create_registration, get_activity, get_activity_registrations,
        get_all_users, get_material_list, get_registration, get_user_materials, register,
        update_registration, update_user, update_user_material, who_am_i,
    },
    auth::{login, logout},
    get_user,
    state::AppState,
};
use axum::{
    extract::State,
    routing::{get, post, put},
    Json, Router,
};
use memory_serve::{load_assets, MemoryServe};
use tower_http::{trace, trace::TraceLayer};
use tracing::Level;

pub fn create_router(state: AppState) -> Router {
    let memory_router = MemoryServe::new(load_assets!("../frontend/dist"))
        .index_file(None)
        .into_router();

    Router::new()
        .merge(memory_router)
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
        .route("/user", get(get_all_users))
        .route("/user/{:id}", get(get_user).put(update_user))
        .route("/user/{:id}/material", get(get_material_list))
        .route("/user/{:id}/getMaterial", get(get_user_materials))
        .route("/user/{:id}/material/update", put(update_user_material))
        .route("/activity", post(create_activity))
        .route("/activity/{:id}", get(get_activity))
        .route(
            "/activity/{:id}/registration",
            get(get_activity_registrations),
        )
        .route(
            "/activity/{:activity_id}/registration/{:user_id}",
            get(get_registration)
                .post(create_registration)
                .put(update_registration),
        )
}

async fn version(State(state): State<AppState>) -> Json<String> {
    Json(state.config().version.clone())
}
