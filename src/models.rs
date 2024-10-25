use axum::http::StatusCode;
use diesel::prelude::*;
use diesel::r2d2;
use diesel::r2d2::ConnectionManager;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Queryable,Serialize)]
pub struct User {
    pub id: i32,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub password_hash: String,
}

#[derive(Insertable, Deserialize, AsChangeset)]
#[diesel(table_name = crate::schema::users)]
pub struct NewUser {
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub password_hash: String,
}

#[derive(Deserialize)]
pub struct SignInData {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub exp: usize,
    pub iat: usize,
    pub email: String,
}

pub struct AuthError {
    pub message: String,
    pub status_code: StatusCode,
}

pub type DbPool = Arc<r2d2::Pool<ConnectionManager<PgConnection>>>;