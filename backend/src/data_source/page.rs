use crate::location::{Location, LocationContent};
use crate::{
    AppState, Language,
    data_source::Count,
    error::{AppResult, Error},
    page::{Page, PageContent},
};
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

pub struct PageStore {
    db: PgPool,
}

impl FromRequestParts<AppState> for PageStore {
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

struct PgPage {
    page_id: Uuid,
    page_name_nl: String,
    page_name_en: String,
    slug: String,
    content_en: String,
    content_nl: String,
    is_public: bool,
    created_by: Uuid,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl From<PgPage> for Page {
    fn from(pg: PgPage) -> Self {
        Self {
            page_id: pg.page_id,
            slug: pg.slug,
            content: PageContent {
                name: Language {
                    en: pg.page_name_en,
                    nl: pg.page_name_nl,
                },
                content: Language {
                    en: pg.content_en,
                    nl: pg.content_nl,
                },
                is_public: pg.is_public,
            },
            created_by: pg.created_by,
            created: pg.created,
            updated: pg.updated,
        }
    }
}

impl PageStore {
    pub async fn count(&self) -> AppResult<Count> {
        Ok(sqlx::query_as!(
            Count,
            r#"
            SELECT COUNT(*) AS "count!" FROM pages
            "#
        )
        .fetch_one(&self.db)
        .await?)
    }

    pub async fn create_page(
        &self,
        new: PageContent,
        slug: &str,
        created_by: Uuid,
    ) -> AppResult<Page> {
        let page_id = Uuid::now_v7();

        Ok(sqlx::query_as!(
            PgPage,
            r#"
            INSERT INTO pages (page_id, page_name_nl, page_name_en, slug, content_nl, content_en, is_public,created_by, created, updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8,now(), now())
            RETURNING *
            "#,
            page_id,
            new.name.nl,
            new.name.en,
            slug,
            new.content.nl,
            new.content.en,
            new.is_public,
            created_by,


        )
            .fetch_one(&self.db)
            .await?
            .into())
    }

    pub async fn update_page(&self, updated: PageContent, slug: &str) -> AppResult<Page> {
        Ok(sqlx::query_as!(
            PgPage,
            r#"
            UPDATE pages
            SET page_name_en = $2,
                page_name_nl   = $3,
                is_public = $4,
                content_en = $5,
                content_nl = $6,
                updated = now()
            WHERE slug = $1
            RETURNING *
            "#,
            slug,
            updated.name.en,
            updated.name.nl,
            updated.is_public,
            updated.content.en,
            updated.content.nl,
        )
        .fetch_one(&self.db)
        .await?
        .into())
    }

    pub async fn get_page(&self, slug: &str) -> AppResult<Page> {
        Ok(
            sqlx::query_as!(PgPage, r#"SELECT * FROM pages WHERE slug = $1"#, slug)
                .fetch_one(&self.db)
                .await?
                .into(),
        )
    }

    pub async fn delete_page(&self, slug: &str) -> AppResult<()> {
        sqlx::query!(r#"DELETE FROM pages WHERE slug = $1"#, slug)
            .execute(&self.db)
            .await?;
        Ok(())
    }
}
