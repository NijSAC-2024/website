use axum::http::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE}
    , Method,
};
use axum::routing::{get, post};
use axum::{middleware, Router};
use diesel::r2d2::ConnectionManager;
use diesel::{r2d2, PgConnection};
use dotenvy::dotenv;
use std::env;
use std::sync::Arc;
use tokio::signal;
use tower_http::cors::CorsLayer;

mod models;
mod handlers;
mod schema;
mod auth;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .max_size(5)
        .build(manager)
        .expect("Failed to create pool.");
    let db_connection = Arc::new(pool);

    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173".parse().unwrap(), // Local development
            "http://example.com".parse().unwrap(),    // Production
            // Add other origins here
        ])
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE, Method::OPTIONS])
        .allow_credentials(true)
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE]);


    let app = Router::new()
        .route("/api/register", post(handlers::create_user))
        .route("/api/login", post(handlers::login))
        .route(
            "/api/test",
            get(handlers::hello).layer(middleware::from_fn(auth::authorize)),
        )
        // .route("/todos/:id", get(handlers::get_user))
        // .route("/todos/:id", post(handlers::update_user))
        // .route("/todos/:id", delete(handlers::delete_user))
        .with_state(db_connection.clone())
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    let server = axum::serve(listener, app).with_graceful_shutdown(shutdown_signal());

    tokio::spawn(async move {
        println!("Server is running");
    });

    if let Err(e) = server.await {
        eprintln!("Server error: {}", e);
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    println!("signal received, starting graceful shutdown");
}