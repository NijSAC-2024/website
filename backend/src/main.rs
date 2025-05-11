use nijsac_website_backend::{AppState, create_router};
use std::net::SocketAddr;
use tokio::{net::TcpListener, signal};
use tracing::info;
use tracing_subscriber::{EnvFilter, fmt, layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(fmt::layer().with_file(true).with_line_number(true))
        .with(EnvFilter::new(std::env::var("RUST_LOG").unwrap_or_else(
            |_| "memory_serve=info,nijsac_website_backend=trace,tower_http=info,sqlx=info".into(),
        )))
        .init();

    let state = AppState::new().await.unwrap();
    sqlx::migrate!().run(state.pool()).await.unwrap();

    let app = create_router(state);
    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));

    tracing::debug!("listening on {}", addr);

    let listener = TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .unwrap();
}

async fn shutdown_signal() {
    let mut terminate = signal::unix::signal(signal::unix::SignalKind::terminate())
        .expect("failed to install signal handler");

    tokio::select! {
        _ = signal::ctrl_c() => {},
        _ = terminate.recv() => {},
    }

    info!("signal received, starting graceful shutdown");
}
