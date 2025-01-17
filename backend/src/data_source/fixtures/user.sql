INSERT INTO "user" (id, first_name, infix, last_name, phone, roles, status, email, pw_hash, created,
                    updated)
VALUES ('1fcffdcc-be86-4f86-9567-9cc48f4bc9bf',
        'Max',
        'van',
        'Mustermann',
        '+31 6 123456',
        '[]',
        'member',
        'max.musterman@email.com',
        '$argon2id$v=19$m=16,t=2,p=1$amYyak9nVHEwMXRUWTRXTg$vmuZAZFXNrvSLpzPjHLseg', -- max
        '2025-01-11 13:14:17.997000 +00:00',
        '2025-01-11 13:14:17.997000 +00:00');

INSERT INTO "user" (id, first_name, last_name, phone, roles, status, email, pw_hash, created,
                    updated)
VALUES ('30269618-160d-4a56-83af-7fc0c1996235',
        'admin',
        'admin',
        '+31 6 123456',
        '["admin"]',
        'member',
        'admin@email.com',
        '$argon2id$v=19$m=16,t=2,p=1$amYyak9nVHEwMXRUWTRXTg$i3wKKpuRBUeYO8AYmSZ5uQ', -- admin
        '2025-01-11 13:14:17.997000 +00:00',
        '2025-01-11 13:14:17.997000 +00:00');
