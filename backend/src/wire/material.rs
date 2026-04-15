use crate::user::UserId;
use serde::{Deserialize, Serialize};
use std::ops::Deref;
use uuid::Uuid;
use validator::Validate;

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq, Clone, derive_more::Display, sqlx::Type)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct MaterialId(Uuid);

impl From<Uuid> for MaterialId {
    fn from(id: Uuid) -> Self {
        MaterialId(id)
    }
}

impl Deref for MaterialId {
    type Target = Uuid;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct Material {
    pub material_id: MaterialId,
    #[validate(length(min = 1, max = 100))]
    pub name_en: String,
    #[validate(length(min = 1, max = 100))]
    pub name_nl: String,
}

#[derive(Debug, Serialize, Deserialize, Validate)]
pub struct UserMaterial {
    pub user_id: UserId,
    pub material_id: MaterialId,
    #[validate(range(
        min = 0,
        max = 999_999_999,
        message = "material amount has a maximum of 9 numbers"
    ))]
    pub material_amount: i32,
}
