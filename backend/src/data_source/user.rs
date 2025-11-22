use crate::{
    AppState, Pagination,
    auth::role::MembershipStatus,
    data_source::Count,
    error::{AppResult, Error},
    user::BasicUser,
    wire::user::{User, UserContent, UserId},
};
use axum::{extract::FromRequestParts, http::request::Parts};
use sqlx::PgPool;
use std::ops::Deref;
use time::OffsetDateTime;
use uuid::Uuid;

pub struct UserStore {
    db: PgPool,
}

impl UserStore {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }
}

impl FromRequestParts<AppState> for UserStore {
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

#[derive(Debug)]
pub struct PgUser {
    id: Uuid,
    first_name: String,
    infix: Option<String>,
    last_name: String,
    phone: String,
    student_number: Option<i32>,
    nkbv_number: Option<i32>,
    sportcard_number: Option<i32>,
    ice_contact_name: Option<String>,
    ice_contact_email: Option<String>,
    ice_contact_phone: Option<String>,
    important_info: Option<String>,
    roles: serde_json::Value,
    status: MembershipStatus,
    email: String,
    created: OffsetDateTime,
    updated: OffsetDateTime,
}

impl TryFrom<PgUser> for User {
    type Error = Error;

    fn try_from(pg: PgUser) -> Result<Self, Self::Error> {
        Ok(Self {
            id: pg.id.into(),
            created: pg.created,
            updated: pg.updated,
            content: UserContent {
                first_name: pg.first_name,
                infix: pg.infix,
                last_name: pg.last_name,
                roles: serde_json::from_value(pg.roles)?,
                status: pg.status,
                email: pg.email,
                phone: pg.phone,
                student_number: pg.student_number,
                nkbv_number: pg.nkbv_number,
                sportcard_number: pg.sportcard_number,
                ice_contact_name: pg.ice_contact_name,
                ice_contact_email: pg.ice_contact_email,
                ice_contact_phone: pg.ice_contact_phone,
                important_info: pg.important_info,
            },
        })
    }
}

impl UserStore {
    pub async fn count(&self) -> AppResult<Count> {
        let count = sqlx::query_as!(
            Count,
            r#"
            SELECT COUNT(*) AS "count!" FROM "user"
            "#
        )
        .fetch_one(&self.db)
        .await?;
        Ok(count)
    }

    pub async fn create(&self, new: &UserContent) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            INSERT INTO "user"
            (id,
             first_name,
             infix,
             last_name,
             phone,
             student_number,
             nkbv_number,
             sportcard_number,
             ice_contact_name,
             ice_contact_email,
             ice_contact_phone,
             important_info,
             roles,
             status,
             email,
             created,
             updated)
            VALUES ($1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13,
                    $14::membership_status,
                    $15,
                    now(),
                    now())
            RETURNING
                id,
                first_name,
                infix,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            Uuid::now_v7(),
            new.first_name,
            new.infix,
            new.last_name,
            new.phone,
            new.student_number,
            new.nkbv_number,
            new.sportcard_number,
            new.ice_contact_name,
            new.ice_contact_email,
            new.ice_contact_phone,
            new.important_info,
            serde_json::to_value(&new.roles)?,
            new.status as MembershipStatus,
            new.email,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get(&self, id: &UserId) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            SELECT 
                id,
                first_name,
                infix,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            FROM "user" WHERE id = $1
            "#,
            id.deref()
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn get_basic_info(&self, id: &UserId) -> AppResult<BasicUser> {
        Ok(sqlx::query_as!(
            BasicUser,
            r#"
            SELECT
                id,
                first_name,
                infix,
                last_name
            FROM "user" WHERE id = $1
            "#,
            id.deref()
        )
        .fetch_one(&self.db)
        .await?)
    }

    pub async fn get_all_detailed(&self, pagination: &Pagination) -> AppResult<Vec<User>> {
        sqlx::query_as!(
            PgUser,
            r#"
            SELECT
                id,
                first_name,
                infix,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            FROM "user"
            WHERE id != '00000000-0000-0000-0000-000000000000'
            ORDER BY last_name
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

    pub async fn get_all_basic_info(&self, pagination: &Pagination) -> AppResult<Vec<BasicUser>> {
        Ok(sqlx::query_as!(
            BasicUser,
            r#"
            SELECT 
                id,
                first_name,
                infix,
                last_name
            FROM "user"
            WHERE id != '00000000-0000-0000-0000-000000000000'
            ORDER BY last_name
            LIMIT $1
            OFFSET $2
            "#,
            pagination.limit,
            pagination.offset
        )
        .fetch_all(&self.db)
        .await?)
    }

    pub async fn update(&self, id: &UserId, user: UserContent) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            UPDATE "user"
            SET first_name = $2,
                infix = $3,
                last_name = $4,
                phone = $5,
                student_number = $6,
                nkbv_number = $7,
                sportcard_number = $8,
                ice_contact_name = $9,
                ice_contact_email = $10,
                ice_contact_phone = $11,
                important_info = $12,
                roles = $13,
                status = $14,
                email = $15,
                updated = now()
            WHERE id = $1
            RETURNING
                id,
                first_name,
                infix,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            id.deref(),
            user.first_name,
            user.infix,
            user.last_name,
            user.phone,
            user.student_number,
            user.nkbv_number,
            user.sportcard_number,
            user.ice_contact_name,
            user.ice_contact_email,
            user.ice_contact_phone,
            user.important_info,
            serde_json::to_value(&user.roles)?,
            user.status as MembershipStatus,
            user.email,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn self_update(&self, id: &UserId, user: UserContent) -> AppResult<User> {
        sqlx::query_as!(
            PgUser,
            r#"
            UPDATE "user"
            SET phone = $2,
                student_number = $3,
                nkbv_number = $4,
                sportcard_number = $5,
                ice_contact_name = $6,
                ice_contact_email = $7,
                ice_contact_phone = $8,
                important_info = $9,
                email = $10,
                updated = now()
            WHERE id = $1
            RETURNING
                id,
                first_name,
                infix,
                last_name,
                phone,
                student_number,
                nkbv_number,
                sportcard_number,
                ice_contact_name,
                ice_contact_email,
                ice_contact_phone,
                important_info,
                roles,
                status AS "status: MembershipStatus",
                email,
                created,
                updated
            "#,
            id.deref(),
            user.phone,
            user.student_number,
            user.nkbv_number,
            user.sportcard_number,
            user.ice_contact_name,
            user.ice_contact_email,
            user.ice_contact_phone,
            user.important_info,
            user.email,
        )
        .fetch_one(&self.db)
        .await?
        .try_into()
    }

    pub async fn update_pwd(&self, id: &UserId, new_pwd_hash: Option<&str>) -> AppResult<()> {
        sqlx::query!(
            r#"
            UPDATE "user" 
            SET pw_hash = $2,
                updated = now()
            WHERE id = $1
            "#,
            id.deref(),
            new_pwd_hash,
        )
        .execute(&self.db)
        .await?;

        Ok(())
    }

    pub async fn delete(&self, id: &UserId) -> AppResult<()> {
        let mut tx = self.db.begin().await?;

        sqlx::query!(
            r#"
            UPDATE event
            SET created_by = '00000000-0000-0000-0000-000000000000' -- deleted user
            WHERE created_by = $1
            "#,
            **id
        )
        .execute(&mut *tx)
        .await?;

        sqlx::query!(
            r#"
            UPDATE event_registration
            SET user_id = '00000000-0000-0000-0000-000000000000' -- deleted user
            WHERE user_id = $1
            "#,
            **id
        )
        .execute(&mut *tx)
        .await?;

        sqlx::query!(
            r#"
            DELETE FROM "user" WHERE id = $1
            "#,
            **id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(())
    }
}
