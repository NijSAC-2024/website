create type membership_status as enum ('pending', 'member', 'affiliated', 'non_member', 'donor');

create table "user"
(
    id                uuid primary key,
    first_name        text              not null,
    infix             text,
    last_name         text              not null,
    phone             text              not null,
    student_number    text,
    nkbv_number       text,
    sportcard_number  text,
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
            references "user" (id) on delete cascade,
    expiration   timestamptz not null
);

create table file
(
    id                uuid        not null primary key,
    original_filename text        not null,
    mime_type         text,
    size              integer     not null,
    created_by        uuid        not null references "user" (id),
    created           timestamptz not null
);

create table location
(
    id             uuid primary key,
    name_nl        text        not null,
    name_en        text        not null,
    description_nl text        not null default '',
    description_en text        not null default '',
    reusable       bool        not null,
    created        timestamptz not null,
    updated        timestamptz not null
);

create type committee_role as enum ('chair', 'member');

create table committee
(
    id             uuid        primary key,
    name_nl        text        not null,
    name_en        text        not null,
    description_nl text        not null default '',
    description_en text        not null default '',
    image                      uuid references file (id),
    created        timestamptz not null,
    updated        timestamptz not null
);

create table user_committee
(
    id           uuid           primary key,
    user_id      uuid           not null references "user" (id) on delete cascade,
    committee_id uuid           not null references committee (id) on delete cascade,
    role         committee_role not null default 'member',
    joined       timestamptz    not null default now(),
    "left"       timestamptz
);

create table event --event base
(
    id                         uuid primary key,
    location_id                uuid                not null references location (id),
    name_nl                    text                not null,
    name_en                    text                not null,
    image                      uuid references file (id),
    start_dates                timestamptz[]       not null default '{}',
    end_dates                  timestamptz[]       not null default '{}',
    description_nl             text                not null default '',
    description_en             text                not null default '', -- location also has its own description
    registration_start         timestamptz,
    registration_end           timestamptz,
    registration_max           integer,
    waiting_list_max           integer,
    is_published               boolean             not null default true,
    -- Courses only members, climbing activities only affiliated, activities only donors, some for all
    -- Null means that everyone, also externals can participate
    required_membership_status membership_status[] not null default '{"member"}',
    event_type                 text                not null,
    -- example scheme:
    -- [
    --  {
    --    "id": "24e2256c-4612-4774-a8ce-168c7817fbd4",
    --    "question": {
    --      "en": "What is your favorite color?",
    --      "nl": "Wat is je favoriete kleur?"
    --    },
    --    "questionType": {
    --      "type": "multipleChoice",
    --      "options": [
    --        {
    --          "en": "Red",
    --          "nl": "Rood"
    --        },
    --        {
    --          "en": "Green",
    --          "nl": "Groen"
    --        },
    --      ]
    --    },
    --    "required": true
    --  }
    -- ]
    questions                  jsonb               not null,            -- if no questions are asked, use an empty array
    -- example scheme:
    -- { "weekendType": "singlePitch" }
    metadata                   jsonb               not null,            -- if no metadata is given, use an empty object
    created_by                 uuid                not null references committee (id),
    created                    timestamptz         not null,
    updated                    timestamptz         not null
);

create table event_registration
(
    registration_id       uuid        not null primary key,
    event_id              uuid        not null references event (id) on delete cascade,
    user_id               uuid        references "user" (id) on delete SET NULL,

    -- Answers to the questions. Example scheme:
    -- [
    --   {
    --     "questionId": "24e2256c-4612-4774-a8ce-168c7817fbd4",
    --     "answer": "blue"
    --   }
    -- ]
    -- if no answers are given, use an empty array
    answers               jsonb       not null,
    attended              boolean,
    -- null means not on the waiting list but regularly registered, 0 is the first list position
    waiting_list_position integer,
    created               timestamptz not null,
    updated               timestamptz not null,
    constraint user_can_register_only_once
        unique (event_id, user_id),
    constraint consistent_waiting_list
        unique (event_id, waiting_list_position)
);

create type basic_user as
(
    id         uuid,
    first_name text,
    infix      text,
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

create table pages
(
    page_id      uuid        not null primary key,
    page_name_nl text        not null,
    page_name_en text        not null,
    slug         text unique not null,
    content_nl   text        not null default '',
    content_en   text        not null default '',
    is_public    boolean     not null default false, -- Probably no need for specific role
    created_by   uuid        not null references "user" (id),
    created      timestamptz not null,
    updated      timestamptz not null
);