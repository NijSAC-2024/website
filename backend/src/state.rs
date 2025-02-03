use crate::error::{AppResult, Error};
use axum::{extract::FromRequestParts, http::request::Parts};
use object_store::{memory::InMemory, ObjectStore};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::{env, ops::Deref, sync::Arc};
use tracing::error;

pub struct Config {
    database_url: String,
    pub version: String,
}

impl Config {
    fn from_env() -> Result<Config, env::VarError> {
        dotenvy::dotenv().ok();
        Ok(Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL env var must be set"),
            version: env::var("VERSION").unwrap_or_else(|_| "development".to_string()),
        })
    }
}

#[derive(Clone)]
pub struct AppState {
    pool: PgPool,
    object_store: Arc<dyn ObjectStore>,
    config: Arc<Config>,
}

impl AppState {
    pub fn config(&self) -> &Config {
        &self.config
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    pub fn object_store(&self) -> Arc<dyn ObjectStore> {
        Arc::clone(&self.object_store)
    }

    pub async fn new() -> AppResult<Self> {
        let config = Config::from_env()?;
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&config.database_url)
            .await
            .inspect_err(|err| error!("Cannot connect to database: {err}"))?;

        // TODO use a proper storage layer
        let object_store = InMemory::new();

        Ok(Self {
            pool,
            object_store: Arc::new(object_store),
            config: Arc::new(config),
        })
    }
}

impl Deref for AppState {
    type Target = PgPool;

    fn deref(&self) -> &Self::Target {
        &self.pool
    }
}

impl FromRequestParts<AppState> for PgPool {
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(state.pool.clone())
    }
}
