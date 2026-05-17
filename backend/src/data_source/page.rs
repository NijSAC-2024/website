use crate::{
    AppState, Language,
    error::{AppResult, Error},
    page::{Page, PageContent, PageId},
    user::UserId,
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::{FromRow, PgPool};
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

#[derive(FromRow)]
struct PgPage {
    page_id: Uuid,
    name_nl: String,
    name_en: String,
    image: Option<Uuid>,
    slug: String,
    content_nl: String,
    content_en: String,
    is_public: bool,
    created_by: UserId,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgPage> for Page {
    type Error = Error;
    fn try_from(pg: PgPage) -> Result<Self, Self::Error> {
        Ok(Page {
            page_id: pg.page_id.into(),
            content: PageContent {
                name: Language {
                    en: pg.name_en,
                    nl: pg.name_nl,
                },
                slug: pg.slug,
                content: Language {
                    en: pg.content_en,
                    nl: pg.content_nl,
                },
                image: pg.image.map(Into::into),
                is_public: pg.is_public,
            },
            created_by: pg.created_by,
            created: pg.created,
            updated: pg.updated,
        })
    }
}

impl PageStore {
    pub async fn get_all(&self, include_private: bool) -> AppResult<Vec<Page>> {
        sqlx::query_as::<_, PgPage>(
            r#"
            SELECT page_id, name_nl, name_en, image, slug, content_nl, content_en, is_public, created_by, created, updated
            FROM pages
            WHERE $1 OR is_public = true
            ORDER BY updated DESC
            "#,
        )
            .bind(include_private)
            .fetch_all(&self.db)
            .await?
            .into_iter().map(Page::try_from).collect()
    }

    pub async fn get_by_slug(&self, slug: &str, include_private: bool) -> AppResult<Page> {
        sqlx::query_as::<_, PgPage>(
            r#"
            SELECT page_id, name_nl, name_en, image, slug, content_nl, content_en, is_public, created_by, created, updated
            FROM pages
            WHERE slug = $1 AND ($2 OR is_public = true)
            "#,
        )
            .bind(slug)
            .bind(include_private)
            .fetch_one(&self.db)
            .await?
            .try_into()
    }

    pub async fn create(&self, content: PageContent, created_by: &UserId) -> AppResult<Page> {
        let id = Uuid::now_v7();

        sqlx::query_as::<_, PgPage>(
            r#"
            INSERT INTO pages (page_id, name_nl, name_en, image, slug, content_nl, content_en, is_public, created_by, created, updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
            RETURNING page_id, name_nl, name_en, image, slug, content_nl, content_en, is_public, created_by, created, updated
            "#,
        )
            .bind(id)
            .bind(content.name.nl)
            .bind(content.name.en)
            .bind(content.image.map(|x| *x))
            .bind(content.slug)
            .bind(content.content.nl)
            .bind(content.content.en)
            .bind(content.is_public)
            .bind(**created_by)
            .fetch_one(&self.db)
            .await?
            .try_into()
    }

    pub async fn update(&self, page_id: &PageId, content: PageContent) -> AppResult<Page> {
        sqlx::query_as::<_, PgPage>(
            r#"
            UPDATE pages
            SET name_nl = $2, name_en = $3, image = $4, slug = $5, content_nl = $6, content_en = $7, is_public = $8, updated = now()
            WHERE page_id = $1
            RETURNING page_id, name_nl, name_en, image, slug, content_nl, content_en, is_public, created_by, created, updated
            "#,
        )
            .bind(**page_id)
            .bind(content.name.nl)
            .bind(content.name.en)
            .bind(content.image.map(|x| *x))
            .bind(content.slug)
            .bind(content.content.nl)
            .bind(content.content.en)
            .bind(content.is_public)
            .fetch_one(&self.db)
            .await?
            .try_into()
    }

    pub async fn delete(&self, page_id: &PageId) -> AppResult<()> {
        sqlx::query("DELETE FROM pages WHERE page_id = $1")
            .bind(**page_id)
            .execute(&self.db)
            .await?;
        Ok(())
    }
}
