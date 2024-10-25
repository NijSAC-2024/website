// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Int4,
        email -> Text,
        first_name -> Text,
        last_name -> Text,
        password_hash -> Text,
    }
}
