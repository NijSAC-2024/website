pub(crate) mod activity;
mod material;
mod user;

use axum::http::HeaderMap;
pub(crate) use material::*;
pub(crate) use user::*;

pub(crate) struct Count {
    count: i64,
}

impl Count {
    pub fn as_header(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert("X-Total-Count", self.count.to_string().parse().unwrap());
        headers
    }
}
