use serde::{Deserialize, Serialize};
use validator::Validate;

pub mod committee;
pub mod event;
pub mod file;
pub mod location;
pub mod material;
pub mod user;
pub mod page;

#[derive(Serialize, Deserialize, Debug, Validate, Default)]
pub struct Language {
    #[validate(length(min = 0, max = 50000))]
    pub en: String,
    #[validate(length(min = 0, max = 50000))]
    pub nl: String,
}
