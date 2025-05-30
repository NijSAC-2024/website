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

    ActivityCommissionMember,
    // TODO extend
}

#[derive(sqlx::Type, Serialize, Deserialize, Debug, Clone, Copy)]
#[sqlx(type_name = "membership_status", rename_all = "snake_case")]
#[serde(rename_all = "camelCase")]
pub enum MembershipStatus {
    Pending,
    Member,
    Extraordinary,
    NonMember,
    Donor,
}

impl MembershipStatus {
    pub fn is_member(&self) -> bool {
        match self {
            MembershipStatus::Pending | MembershipStatus::NonMember | MembershipStatus::Donor => {
                false
            }
            MembershipStatus::Member | MembershipStatus::Extraordinary => true,
        }
    }
}
