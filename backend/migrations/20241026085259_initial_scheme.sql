create type membership_status as enum ('pending', 'member', 'extraordinary', 'non_member');

create table "user"
(
    id                uuid primary key,
    first_name        text              not null,
    last_name         text              not null,
    phone             text              not null,
    student_number    numeric,
    nkbv_number       numeric,
    sportcard_number  numeric,
    ice_contact_name  text,
    ice_contact_email text,
    ice_contact_phone text,
    roles             jsonb             not null,
    status            membership_status not null,
    email             text              not null unique,
    pw_hash           text,
    created           timestamptz       not null,
    updated           timestamptz       not null
);

create table "material"
(
    material_id       uuid primary key,
    name_eng text not null,
    name_nl  text not null
);

create table "user_material"
(
    user_id         uuid    not null,
    material_id     uuid    not null,
    material_amount numeric not null
        constraint user_material_pk
            primary key (user_id, material_id)
        constraint fk_material
            foreign key (material_id) references "material" (material_id) on delete cascade
        constraint fk_user
            foreign key (user_id) references "user" (id) on delete cascade
);

create table session
(
    cookie_value text primary key,
    user_id      uuid        not null
        constraint session_user_fk
            references "user",
    expiration   timestamptz not null
);


create table location
(
    id          uuid primary key,
    name        text not null,
    description text
);

create table weekend_type
(
    id          uuid primary key,
    name        text not null,
    description text
);

create table weekend
(
    id                 uuid primary key,
    start              date        not null,
    "end"              date        not null,
    registration_start timestamptz not null,
    registration_end   timestamptz not null,
    location           uuid        not null references location,
    type               uuid        not null references weekend_type,
    description        text,
    created            timestamptz not null,
    updated            timestamptz not null
);

create table weekend_user_role
(
    id          uuid primary key,
    name        text not null,
    description text
);

create table weekend_user
(
    weekend_id uuid not null references weekend,
    user_id    uuid not null references "user",
    role       uuid references weekend_user_role,
    constraint weekend_user_pk
        primary key (weekend_id, user_id)
);

create type basic_user as
(
    id         uuid,
    first_name text,
    last_name  text
);