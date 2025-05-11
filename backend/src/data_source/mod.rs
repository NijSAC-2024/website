pub(crate) mod event;
mod file;
mod location;
mod material;
mod user;

use axum::http::HeaderMap;
pub use file::*;
pub use location::*;
pub use material::*;
pub use user::*;

pub struct Count {
    count: i64,
}

impl Count {
    pub fn as_header(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert("X-Total-Count", self.count.to_string().parse().unwrap());
        headers
    }
}
