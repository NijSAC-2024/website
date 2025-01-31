use crate::{
    error::{AppResult, Error},
    location::{Location, LocationContent, LocationId, UsedBy},
    AppState, LocationFilter,
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

pub struct LocationStore {
    db: PgPool,
}

impl FromRequestParts<AppState> for LocationStore {
    type Rejection = Error;

    async fn from_request_parts(
        _parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        Ok(Self {
            db: state.pool().clone(),
        })
    }
}

struct PgLocation {
    id: Uuid,
    name_nl: String,
    name_en: String,
    reusable: bool,
    description_nl: Option<String>,
    description_en: Option<String>,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl From<PgLocation> for Location {
    fn from(pg: PgLocation) -> Self {
        Self {
            id: pg.id.into(),
            created: pg.created,
            updated: pg.updated,
            content: LocationContent {
                name_nl: pg.name_nl,
                name_en: pg.name_en,
                reusable: pg.reusable,
                description_nl: pg.description_nl,
                description_en: pg.description_en,
            },
        }
    }
}

impl LocationStore {
    pub async fn create(&self, new: LocationContent) -> AppResult<Location> {
        let id = Uuid::now_v7();

        Ok(sqlx::query_as!(
            PgLocation,
            r#"
            INSERT INTO location (id, name_nl, name_en, description_nl, description_en, reusable, created, updated) 
            VALUES ($1, $2, $3, $4, $5, $6, now(), now())
            RETURNING *
            "#,
            id,
            new.name_nl,
            new.name_en,
            new.description_nl,
            new.description_en,
            new.reusable
        )
            .fetch_one(&self.db)
            .await?
            .into())
    }

    pub async fn update(&self, id: &LocationId, updated: LocationContent) -> AppResult<Location> {
        Ok(sqlx::query_as!(
            PgLocation,
            r#"
            UPDATE location
            SET name_nl = $2,
                name_en = $3,
                description_nl = $4,
                description_en = $5,
                reusable = $6,
                updated = now()
            WHERE id = $1
            RETURNING *
            "#,
            **id,
            updated.name_nl,
            updated.name_en,
            updated.description_nl,
            updated.description_en,
            updated.reusable
        )
        .fetch_one(&self.db)
        .await?
        .into())
    }

    pub async fn get_one(&self, id: &LocationId) -> AppResult<Location> {
        Ok(sqlx::query_as!(
            PgLocation,
            r#"
            SELECT * FROM location WHERE id = $1
            "#,
            **id
        )
        .fetch_one(&self.db)
        .await?
        .into())
    }

    pub async fn get_all(&self, filter: &LocationFilter) -> AppResult<Vec<Location>> {
        Ok(sqlx::query_as!(
            PgLocation,
            r#"
            SELECT * FROM location
            WHERE ($1::bool IS NULL OR ($1 AND reusable) OR (NOT $1 AND NOT reusable))
            ORDER BY reusable, updated
            LIMIT $2 OFFSET $3
            "#,
            filter.reusable,
            filter.pagination.limit,
            filter.pagination.offset
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(Into::into)
        .collect())
    }

    pub async fn delete(&self, id: &LocationId) -> AppResult<()> {
        sqlx::query!(
            r#"
            DELETE FROM location WHERE id = $1
            "#,
            **id
        )
        .execute(&self.db)
        .await?;
        Ok(())
    }

    pub async fn used_by(&self, id: &LocationId) -> AppResult<UsedBy> {
        struct PgUsedBy {
            activity: Uuid,
        }

        Ok(sqlx::query_as!(
            PgUsedBy,
            r#"
            SELECT id as activity FROM activity WHERE location_id = $1
            "#,
            **id
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .fold(UsedBy { activities: vec![] }, |mut used_by, pg| {
            used_by.activities.push(pg.activity.into());
            used_by
        }))
    }
}
