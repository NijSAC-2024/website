use crate::{
    AppState, Language,
    committee::{
        Committee, CommitteeContent, CommitteeId, CommitteeRole, CommitteeUser, UserCommittee,
    },
    error::{AppResult, Error, Error::BadRequest},
    user::{BasicUser, UserId},
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::PgPool;
use time::OffsetDateTime;
use uuid::Uuid;

pub struct CommitteeStore {
    db: PgPool,
}

impl FromRequestParts<AppState> for CommitteeStore {
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

struct PgCommittee {
    id: CommitteeId,
    name_nl: String,
    name_en: String,
    description_nl: String,
    description_en: String,
    created: OffsetDateTime,
    updated: OffsetDateTime,
    image: Option<Uuid>,
}

impl TryFrom<PgCommittee> for Committee {
    type Error = Error;

    fn try_from(pg: PgCommittee) -> Result<Self, Self::Error> {
        Ok(Self {
            id: pg.id,
            created: pg.created,
            updated: pg.updated,
            content: CommitteeContent {
                name: Language {
                    en: pg.name_en,
                    nl: pg.name_nl,
                },
                description: Language {
                    en: pg.description_en,
                    nl: pg.description_nl,
                },
                image: pg.image.map(Into::into),
            },
        })
    }
}

pub struct PgCommitteeUser {
    pub id: UserId,
    pub first_name: String,
    pub infix: Option<String>,
    pub last_name: String,
    pub role: CommitteeRole,
}

impl TryFrom<PgCommitteeUser> for CommitteeUser {
    type Error = Error;

    fn try_from(pg: PgCommitteeUser) -> Result<Self, Self::Error> {
        Ok(Self {
            user: BasicUser {
                id: pg.id,
                first_name: pg.first_name,
                infix: pg.infix,
                last_name: pg.last_name,
            },
            role: pg.role,
        })
    }
}

impl CommitteeStore {
    pub async fn ensure_user_in_committee(
        &self,
        user_id: &Uuid,
        committee_id: &Uuid,
    ) -> AppResult<()> {
        let in_committee = sqlx::query_scalar!(
            r#"
            SELECT EXISTS(
                SELECT 1
                FROM user_committee
                WHERE user_id = $1
                  AND committee_id = $2
                  AND "left" IS NULL
            )
            "#,
            *user_id,
            *committee_id
        )
        .fetch_one(&self.db)
        .await?
        .unwrap_or(false);

        if !in_committee {
            return Err(BadRequest("This user is not in committee"));
        }
        Ok(())
    }
    pub async fn get_one(&self, id: &Uuid) -> AppResult<Committee> {
        sqlx::query_as!(
            PgCommittee,
            r#"
            SELECT
                id,
                name_nl,
                name_en,
                description_nl,
                description_en,
                created,
                updated,
                image
            FROM committee
            WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get_all(&self) -> AppResult<Vec<Committee>> {
        sqlx::query_as!(
            PgCommittee,
            r#"
            SELECT
                id,
                name_nl,
                name_en,
                description_nl,
                description_en,
                created,
                updated,
                image
            FROM committee
            ORDER BY updated
            "#
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(TryInto::try_into)
        .collect()
    }

    pub async fn create(&self, new: CommitteeContent) -> AppResult<Committee> {
        let id = Uuid::now_v7();
        sqlx::query_as!(
            PgCommittee,
            r#"
            INSERT INTO committee (
                id,
                name_nl,
                name_en,
                description_nl,
                description_en,
                image,
                created,
                updated
            )
            VALUES ($1, $2, $3, $4, $5, $6, now(), now())
            RETURNING
                id,
                name_nl,
                name_en,
                description_nl,
                description_en,
                created,
                updated,
                image
            "#,
            id,
            new.name.nl,
            new.name.en,
            new.description.nl,
            new.description.en,
            new.image.map(|id| *id)
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn update(&self, id: &Uuid, updated: CommitteeContent) -> AppResult<Committee> {
        sqlx::query_as!(
            PgCommittee,
            r#"
            UPDATE committee
            SET
                name_nl = $2,
                name_en = $3,
                description_nl = $4,
                description_en = $5,
                image = $6,
                updated = now()
            WHERE id = $1
            RETURNING
                id,
                name_nl,
                name_en,
                description_nl,
                description_en,
                created,
                updated,
                image
            "#,
            id,
            updated.name.nl,
            updated.name.en,
            updated.description.nl,
            updated.description.en,
            updated.image.map(|id| *id),
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn delete(&self, id: &Uuid) -> AppResult<()> {
        sqlx::query!("DELETE FROM committee WHERE id = $1", id)
            .execute(&self.db)
            .await?;
        Ok(())
    }

    pub async fn add_user(&self, committee_id: &Uuid, user_id: &Uuid) -> AppResult<BasicUser> {
        Ok(sqlx::query_as!(
            BasicUser,
            r#"
            WITH t AS (
                INSERT INTO user_committee (id, user_id, committee_id, joined)
                VALUES ($1, $2, $3, now())
                RETURNING user_id)
            SELECT u.id, u.first_name, u.last_name, u.infix
            FROM t JOIN "user" u ON u.id = t.user_id
            "#,
            Uuid::now_v7(),
            user_id,
            committee_id
        )
        .fetch_one(&self.db)
        .await?)
    }

    pub async fn remove_user(&self, committee_id: &Uuid, user_id: &Uuid) -> AppResult<()> {
        sqlx::query!(
            r#"
            UPDATE user_committee
            SET "left" = now()
            WHERE committee_id = $1 AND user_id = $2 AND "left" IS NULL
            "#,
            committee_id,
            user_id
        )
        .execute(&self.db)
        .await?;
        Ok(())
    }

    pub async fn get_committee_members(
        &self,
        committee_id: &Uuid,
    ) -> AppResult<Vec<CommitteeUser>> {
        sqlx::query_as!(
            PgCommitteeUser,
            r#"
            SELECT
                u.id,
                u.first_name,
                u.infix,
                u.last_name,
                uc.role AS "role: CommitteeRole"
            FROM "user" u
            JOIN user_committee uc ON u.id = uc.user_id
            WHERE uc.committee_id = $1 AND uc."left" IS NULL
            "#,
            committee_id
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(TryInto::try_into)
        .collect()
    }

    pub async fn get_committees_for_user(&self, user_id: &Uuid) -> AppResult<Vec<UserCommittee>> {
        Ok(sqlx::query_as!(
            UserCommittee,
            r#"
            SELECT user_id, committee_id, role AS "role: CommitteeRole", joined, "left"
            FROM user_committee
            WHERE user_id = $1
            ORDER BY joined DESC
            "#,
            user_id
        )
        .fetch_all(&self.db)
        .await?)
    }

    pub async fn make_chair(&self, committee_id: &Uuid, user_id: &Uuid) -> AppResult<()> {
        // close current chair and capture id
        let old_chair_id: Option<Uuid> = sqlx::query_scalar!(
            r#"
            UPDATE user_committee
            SET "left" = now()
            WHERE committee_id = $1
              AND role = 'chair'
              AND "left" IS NULL
            RETURNING user_id
            "#,
            committee_id,
        )
        .fetch_optional(&self.db)
        .await?;

        // close current entry of new chair
        sqlx::query!(
            r#"
            UPDATE user_committee
            SET "left" = now()
            WHERE committee_id = $1
              AND user_id = $2
              AND "left" IS NULL
            "#,
            committee_id,
            user_id
        )
        .execute(&self.db)
        .await?;

        // insert new chair entry
        sqlx::query!(
            r#"
            INSERT INTO user_committee (committee_id, user_id, role, joined)
            VALUES ($1, $2, 'chair', now())
            "#,
            committee_id,
            user_id
        )
        .execute(&self.db)
        .await?;

        // old chair continues as member
        if let Some(old_id) = old_chair_id {
            sqlx::query!(
                r#"
                INSERT INTO user_committee (committee_id, user_id, role, joined)
                VALUES ($1, $2, 'member', now())
                "#,
                committee_id,
                old_id
            )
            .execute(&self.db)
            .await?;
        }

        Ok(())
    }
}
