use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct Material {
    pub material_id: Uuid, // Change to MaterialId to be the same as others
    #[validate(length(min = 1, max = 100))]
    pub name_en: String,
    #[validate(length(min = 1, max = 100))]
    pub name_nl: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UserMaterial {
    pub user_id: Uuid,     // Change to UserId to be the same as others
    pub material_id: Uuid, // Change to MaterialId to be the same as others
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "material amount has a maximum of 9 numbers"
    ))]
    pub material_amount: i32,
}
