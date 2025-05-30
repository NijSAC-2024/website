use crate::{
    AppState, Language, LocationFilter,
    data_source::Count,
    error::{AppResult, Error},
    location::{Location, LocationContent, LocationId, UsedBy},
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
    description_nl: String,
    description_en: String,
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
                name: Language {
                    en: pg.name_en,
                    nl: pg.name_nl,
                },
                reusable: pg.reusable,
                description: Language {
                    en: pg.description_en,
                    nl: pg.description_nl,
                },
            },
        }
    }
}

impl LocationStore {
    pub async fn count(&self, filter: &LocationFilter) -> AppResult<Count> {
        Ok(sqlx::query_as!(
            Count,
            r#"
            SELECT COUNT(*) AS "count!" FROM location WHERE reusable = $1
            "#,
            filter.reusable
        )
        .fetch_one(&self.db)
        .await?)
    }

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
            new.name.nl,
            new.name.en,
            new.description.nl,
            new.description.en,
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
            updated.name.nl,
            updated.name.en,
            updated.description.nl,
            updated.description.en,
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
            event: Uuid,
        }

        Ok(sqlx::query_as!(
            PgUsedBy,
            r#"
            SELECT id as event FROM event WHERE location_id = $1
            "#,
            **id
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .fold(UsedBy { activities: vec![] }, |mut used_by, pg| {
            used_by.activities.push(pg.event.into());
            used_by
        }))
    }
}
