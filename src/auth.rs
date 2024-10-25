use crate::models::{AuthError, Claims};
use axum::{
    body::Body,
    extract::{Json, Request},
    http,
    http::{Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde_json::json;
use std::env;

impl IntoResponse for AuthError {
    fn into_response(self) -> Response<Body> {
        let body = Json(json!({
            "error": self.message,
        }));

        (self.status_code, body).into_response()
    }
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, bcrypt::BcryptError> {
    verify(password, hash)
}

pub fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    let hash = hash(password, DEFAULT_COST)?;
    Ok(hash)
}

pub fn encode_jwt(email: String) -> Result<String, StatusCode> {
    let now = Utc::now();
    let expire: chrono::TimeDelta = Duration::hours(24);
    let exp: usize = (now + expire).timestamp() as usize;
    let iat: usize = now.timestamp() as usize;

    let claim = Claims { iat, exp, email };
    let secret = env::var("SALT").expect("SALT must be set");

    encode(
        &Header::default(),
        &claim,
        &EncodingKey::from_secret(secret.as_ref()),
    )
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

pub fn decode_jwt(jwt: String) -> Result<TokenData<Claims>, StatusCode> {
    let secret = env::var("SALT").expect("SALT must be set");

    let result: Result<TokenData<Claims>, StatusCode> = decode(
        &jwt,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR);
    result
}

pub async fn authorize(mut req: Request, next: Next) -> Result<Response<Body>, AuthError> {
    let auth_header = req.headers_mut().get(http::header::AUTHORIZATION);

    let auth_header = match auth_header {
        Some(header) => header.to_str().map_err(|_| AuthError {
            message: "Empty header is not allowed".to_string(),
            status_code: StatusCode::FORBIDDEN
        })?,
        None => return Err(AuthError {
            message: "Please add the JWT token to the header".to_string(),
            status_code: StatusCode::FORBIDDEN
        }),
    };

    let mut header = auth_header.split_whitespace();

    let (_bearer, token) = (header.next(), header.next());

    let token_data = match decode_jwt(token.unwrap().to_string()) {
        Ok(data) => data,
        Err(_) => return Err(AuthError {
            message: "Unable to decode token".to_string(),
            status_code: StatusCode::UNAUTHORIZED
        }),
    };

    req.extensions_mut().insert(token_data.claims.email);
    Ok(next.run(req).await)
}