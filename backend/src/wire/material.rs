use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct Material {
    pub material_id: Uuid,
    #[validate(length(min = 1, max = 100))]
    pub name_eng: String,
    #[validate(length(min = 1, max = 100))]
    pub name_nl: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UserMaterial {
    pub user_id: Uuid,
    pub material_id: Uuid,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "material amount has a maximum of 9 numbers"
    ))]
    pub material_amount: i32,
}
