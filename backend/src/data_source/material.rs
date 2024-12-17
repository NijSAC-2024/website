use crate::{
    data_source::Count,
    error::{AppResult, Error},
    user::UserId,
    wire::material::{Material, UserMaterial},
    AppState, Pagination,
};
use axum::{async_trait, extract::FromRequestParts, http::request::Parts};
use sqlx::PgPool;
use std::{convert::TryInto, ops::Deref};
use uuid::Uuid;

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

impl TryFrom<PgUserMaterial> for Option<UserMaterial> {
    type Error = Error;

    fn try_from(pg: PgUserMaterial) -> Result<Self, Self::Error> {
        Ok(Some(UserMaterial {
            user_id: pg.user_id,
            material_id: pg.material_id,
            material_amount: pg.material_amount,
        }))
    }
}

impl MaterialStore {
    pub async fn update_user_material(
        &self,
        user_id: &Uuid,
        material_id: &Uuid,
        material_amount: i32,
    ) -> AppResult<Option<UserMaterial>> {
        if material_amount < 1 {
            sqlx::query!(
                r#"
                    DELETE FROM "user_material"
                    WHERE user_id = $1 AND material_id = $2
                    "#,
                user_id,
                material_id,
            )
            .execute(&self.db)
            .await?;
            Ok(None)
        } else {
            sqlx::query_as!(
                PgUserMaterial,
                r#"
                    INSERT INTO "user_material" (user_id, material_id, material_amount)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, material_id) DO UPDATE
                    SET material_amount = $3
                    RETURNING user_id, material_id, material_amount
                    "#,
                user_id,
                material_id,
                material_amount
            )
            .fetch_one(&self.db)
            .await?
            .try_into()
        }
    }

    pub async fn count(&self, user_id: &UserId) -> AppResult<Count> {
        let count = sqlx::query_as!(
            Count,
            r#"
            SELECT COUNT(*) AS "count!"
            FROM "user_material"
            WHERE user_id = $1
            "#,
            user_id.deref()
        )
        .fetch_one(&self.db)
        .await?;
        Ok(count)
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

    pub async fn count_materials(&self) -> AppResult<Count> {
        let count = sqlx::query_as!(
            Count,
            r#"
        SELECT COUNT(*) as "count!"
        FROM "material"
        "#
        )
        .fetch_one(&self.db)
        .await?;
        Ok(count)
    }

    pub async fn get_material_list(&self, pagination: &Pagination) -> AppResult<Vec<Material>> {
        sqlx::query_as!(
            PgMaterial,
            r#"
        SELECT material_id, name_eng, name_nl
        FROM "material"
        ORDER BY material_id
        LIMIT $1
        OFFSET $2
        "#,
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
