use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Material {
    pub material_id: Uuid,
    pub name_eng: String,
    pub name_nl: String,
}
