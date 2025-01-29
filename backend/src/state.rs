use crate::error::{AppResult, Error};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::{env, ops::Deref, sync::Arc};

pub struct Config {
    database_url: String,
    pub version: String,
}

impl Config {
    fn from_env() -> Result<Config, env::VarError> {
        dotenvy::dotenv().ok();
        Ok(Self {
            database_url: env::var("DATABASE_URL")?,
            version: env::var("VERSION").unwrap_or_else(|_| "development".to_string()),
        })
    }
}

#[derive(Clone)]
pub struct AppState {
    pool: PgPool,
    config: Arc<Config>,
}

impl AppState {
    pub fn config(&self) -> &Config {
        &self.config
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }

    pub async fn new() -> AppResult<Self> {
        let config = Config::from_env()?;
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&config.database_url)
            .await?;
        Ok(Self {
            pool,
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
