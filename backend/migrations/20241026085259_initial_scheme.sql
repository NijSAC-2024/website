create type membership_status as enum ('pending', 'member', 'extraordinary', 'non_member');
create type activity_type as enum ('activity', 'course', 'weekend');
create type question_type as enum ('short', 'long', 'integer');

create table "user"
(
    id                uuid primary key,
    first_name        text              not null,
    last_name         text              not null,
    phone             text              not null,
    student_number    integer,
    nkbv_number       integer,
    sportcard_number  integer,
    ice_contact_name  text,
    ice_contact_email text,
    ice_contact_phone text,
    important_info    text, -- In practice, it has shown to be useful, things like allergies, or other important stuff
    roles             jsonb             not null,
    status            membership_status not null,
    email             text              not null unique,
    pw_hash           text,
    created           timestamptz       not null,
    updated           timestamptz       not null
);

create table session
(
    cookie_value text primary key,
    user_id      uuid        not null
        constraint session_user_fk
            references "user" (id),
    expiration   timestamptz not null
);

create table location
(
    id             uuid primary key,
    name_nl        text not null,
    name_en        text not null,
    description_nl text,
    description_en text
);

create table activity --Activity base
(
    id                         uuid primary key,
    location_id                uuid                not null references location (id),
    name_nl                    text                not null,
    name_en                    text                not null,
    description_nl             text,
    description_en             text, -- location also has a description
    start_time                 timestamptz         not null,
    end_time                   timestamptz         not null,
    registration_start         timestamptz         not null,
    registration_end           timestamptz         not null,
    registration_max           integer             not null,
    waiting_list_max           integer             not null,
    created_at                 timestamptz         not null,
    updated_at                 timestamptz         not null,
    is_hidden                  boolean             not null default false,
    -- Courses only members, climbing activities only extraordinary, activities only donors, some for all
    required_membership_status membership_status[] not null default '{"member"}',
    -- Probably want course type too, requires stuff that repeats, but for the agenda you don't want to see that
    activity_type              activity_type       not null
);

create table activity_registrations
(
    activity_id uuid              not null references activity (id) on delete cascade,
    user_id     uuid              not null references "user" (id), -- On deletion, we want to replace it with a 'deleted' user
    status      membership_status not null,
    created     timestamptz       not null,
    attended    boolean           not null default false,
    constraint activity_registrations_pk
        primary key (activity_id, user_id)
);

create table activity_weekend -- For extra information about a weekend
(
    activity_id    uuid primary key references activity (id) on delete cascade,
    weekend_type   text not null, -- Single-pitch / Multi-pitch / Bouldering
    description_nl text,          -- Information that is required for the type of weekend
    description_en text
);

create table activity_registration_question
(
    question_id uuid not null,
    activity_id uuid not null,
    "order"     int  not null,
    constraint unambiguous_order
        unique (activity_id, "order"),
    constraint pk_activity_registration_question
        primary key (question_id, activity_id)
);

create table registration_question
(
    id               uuid primary key,
    question_type    question_type not null,
    question_text_nl text          not null,
    question_text_en text          not null,
    question_order   int           not null,
    created          timestamptz   not null,
    updated          timestamptz   not null
);

create table registration_answer
(
    activity_id uuid        not null references activity (id) on delete cascade,
    user_id     uuid        not null references "user" (id) on delete cascade,
    question_id uuid        not null references registration_question (id) on delete cascade,
    answer_text text        not null, -- TODO we might not want to convert all answers to text
    created     timestamptz not null,
    updated     timestamptz not null,
    constraint pk_registration_answer
        primary key (user_id, question_id, activity_id)
);

create type basic_user as
(
    id         uuid,
    first_name text,
    last_name  text
);

-- Maybe keep the following to use as prefill for registrations:
create table "material"
(
    material_id uuid primary key,
    name_en     text not null,
    name_nl     text not null
);

create table "user_material"
(
    user_id         uuid    not null,
    material_id     uuid    not null,
    material_amount integer not null, -- Probably want this not null, for qol?
    constraint user_material_pk
        primary key (user_id, material_id),
    constraint fk_material
        foreign key (material_id) references "material" (material_id) on delete cascade,
    constraint fk_user
        foreign key (user_id) references "user" (id) on delete cascade
);


