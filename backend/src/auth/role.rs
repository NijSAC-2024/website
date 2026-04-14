use serde::{Deserialize, Serialize};

pub type Roles = Vec<Role>;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub enum Role {
    Admin,
    Treasurer,
    Secretary,
    Chair,
    ViceChair,
    ClimbingCommissar,
}

#[derive(sqlx::Type, Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq)]
#[sqlx(type_name = "membership", rename_all = "snake_case")]
#[serde(rename_all = "camelCase")]
pub enum Membership {
    NonMember,
    Member,
    Affiliated,
    Donor,
}

#[derive(sqlx::Type, Serialize, Deserialize, Debug, Clone, Copy, PartialEq, Eq)]
#[sqlx(type_name = "status", rename_all = "snake_case")]
#[serde(rename_all = "camelCase")]
pub enum Status {
    Pending,
    Accepted,
    Rejected,
}

impl Membership {
    pub fn is_member(&self) -> bool {
        match self {
            Membership::Donor | Membership::NonMember => false,
            Membership::Member | Membership::Affiliated => true,
        }
    }
}
