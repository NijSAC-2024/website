use serde::{Deserialize, Serialize};
use validator::Validate;

pub mod activity;
pub mod file;
pub mod location;
pub mod material;
pub mod user;

#[derive(Serialize, Deserialize, Debug, Validate)]
pub struct Language {
    #[validate(length(min = 1, max = 50000))]
    pub en: String,
    #[validate(length(min = 1, max = 50000))]
    pub nl: String,
}
