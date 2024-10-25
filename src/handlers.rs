use crate::models::{DbPool, NewUser, SignInData, User};
use axum::{extract::State, http::StatusCode, Extension, Json};
use axum::response::IntoResponse;
use diesel::prelude::*;

use crate::schema::users;

use crate::auth::{encode_jwt, hash_password, verify_password};

pub async fn hello(Extension(email): Extension<String>) -> impl IntoResponse {
    Json(email)
}

pub async fn create_user(
    State(db): State<DbPool>,
    Json(mut new_user): Json<NewUser>,
) -> (StatusCode,Json<String>) {
    let mut conn = db.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();

    new_user.password_hash = hash_password(&new_user.password_hash).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();

    let user: User = diesel::insert_into(users::table)
        .values(&new_user)
        .get_result(&mut conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();

    let token = encode_jwt(user.email)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();

    (StatusCode::CREATED, Json(token))
}

pub async fn login(
    State(db): State<DbPool>,
    Json(user_data): Json<SignInData>
) -> Result<Json<String>, StatusCode> {

    // 1. Retrieve user from the database
    let user = match retrieve_user_by_email(&user_data.email, db) {
        Some(user) => user,
        None => return Err(StatusCode::UNAUTHORIZED), // User not found
    };

    // 2. Compare the password
    if !verify_password(&user_data.password, &user.password_hash)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)? // Handle bcrypt errors
    {
        return Err(StatusCode::UNAUTHORIZED); // Wrong password
    }

    // 3. Generate JWT
    let token = encode_jwt(user.email)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 4. Return the token
    Ok(Json(token))
}

fn retrieve_user_by_email(user_email: &str, db: DbPool) -> Option<User> {
    let mut conn = db.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();

    let current_user = users::table.filter(users::email.eq(user_email)).first::<User>(&mut conn)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
    Some(current_user)
}

// pub async fn get_users(
//     State(db): State<DbPool>,
// ) -> (StatusCode,Json<Vec<User>>) {
//     let mut conn = db.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     let results = users::table.load::<User>(&mut conn)
//         .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     (StatusCode::OK, Json(results))
// }
//
// pub async fn get_user(
//     Path(user_id): Path<i32>,
//     State(db): State<DbPool>,
// ) -> (StatusCode,Json<User>) {
//     let mut conn = db.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     let result = users::table.filter(id.eq(user_id)).first::<User>(&mut conn)
//         .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     (StatusCode::OK, Json(result))
// }
//
// pub async fn update_user(
//     Path(user_id): Path<i32>,
//     State(db): State<DbPool>,
//     Json(update_user): Json<User>,
// ) -> (StatusCode,Json<User>) {
//     let mut conn = db.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     let user = diesel::update(users::table.filter(id.eq(user_id)))
//         .set(&update_user)
//         .get_result(&mut conn)
//         .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     (StatusCode::OK, Json(user))
// }
//
// pub async fn delete_user(
//     Path(user_id): Path<i32>,
//     State(db): State<DbPool>,
// ) -> StatusCode {
//     let mut conn = db.get().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     let _ =diesel::delete(users::table.filter(id.eq(user_id)))
//         .execute(&mut conn)
//         .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR).unwrap();
//
//     StatusCode::NO_CONTENT
// }