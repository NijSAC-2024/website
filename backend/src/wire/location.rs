use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Location {
    pub id: Uuid,
    pub name_nl: String,
    pub name_en: String,
    pub description_nl: Option<String>,
    pub description_en: Option<String>,
}