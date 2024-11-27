use crate::{
    error::{AppResult, Error},
    AppState,
    wire::material::{Material, UserMaterial},
    Pagination,
};
use uuid::Uuid;
use sqlx::PgPool;
use axum::{
    async_trait,
    extract::{FromRequestParts},
    http::request::Parts,
};

pub(crate) struct MaterialStore {
    db: PgPool,
}

#[async_trait]
impl FromRequestParts<AppState> for MaterialStore {
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(Self {
            db: state.pool().clone(), // Assuming `state.pool()` returns the PgPool
        })
    }
}

#[derive(Debug)]
pub struct PgMaterial {
    pub material_id: Uuid,
    pub name_eng: String,
    pub name_nl: String,
}

pub struct PgUserMaterial {
    pub user_id: Uuid,
    pub material_id: Uuid,
    pub material_amount: i32,
}

impl TryFrom<PgMaterial> for Material {
    type Error = Error;

    fn try_from(pg: PgMaterial) -> Result<Self, Self::Error> {
        Ok(Self {
            material_id: pg.material_id,
            name_eng: pg.name_eng,
            name_nl: pg.name_nl,
        })
    }
}

impl TryFrom<PgUserMaterial> for UserMaterial {
    type Error = Error;

    fn try_from(pg: PgUserMaterial) -> Result<Self, Self::Error> {
        Ok(Self {
            user_id: pg.user_id,
            material_id: pg.material_id,
            material_amount: pg.material_amount,
        })
    }

}

impl MaterialStore {
    pub async fn add_user_material(
        &self,
        user_id: &Uuid,
        material_id: &Uuid,
        material_amount: i32,
    ) -> AppResult<UserMaterial> {
        sqlx::query_as!(
            PgUserMaterial,
            r#"
            INSERT INTO "user_material" (user_id, material_id, material_amount)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, material_id) DO UPDATE
            SET material_amount = $3
            RETURNING
                user_id,
                material_id,
                material_amount
            "#,
            user_id,
            material_id,
            material_amount
        )
            .fetch_one(&self.db)
            .await?
            .try_into()
    }

    pub async fn update_user_material_amount(
        &self,
        user_id: &Uuid,
        material_id: &Uuid,
        new_material_amount: i32,
    ) -> AppResult<Option<UserMaterial>> {
        if new_material_amount < 1 {
            sqlx::query!(
            r#"
            DELETE FROM "user_material"
            WHERE user_id = $1 AND material_id = $2
            "#,
            user_id,
            material_id
        )
                .execute(&self.db)
                .await?;

            return Ok(None);
        }

        let updated_material = sqlx::query_as!(
        PgUserMaterial,
        r#"
        UPDATE "user_material"
        SET material_amount = $3
        WHERE user_id = $1 AND material_id = $2
        RETURNING user_id, material_id, material_amount
        "#,
        user_id,
        material_id,
        new_material_amount
    )
            .fetch_one(&self.db)
            .await?;

        Ok(Some(updated_material.try_into()?))
    }

    pub async fn get_user_materials(
        &self,
        user_id: &Uuid,
        pagination: &Pagination,
    ) -> AppResult<Vec<UserMaterial>> {
        sqlx::query_as!(
            PgUserMaterial,
            r#"
            SELECT user_id, material_id, material_amount
            FROM "user_material"
            WHERE user_id = $1
            ORDER BY material_id
            LIMIT $2
            OFFSET $3
            "#,
            user_id,
            pagination.limit,
            pagination.offset
        )
            .fetch_all(&self.db)
            .await?
            .into_iter()
            .map(TryInto::try_into)
            .collect()
    }

}