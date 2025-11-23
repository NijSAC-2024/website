-- Committees
INSERT INTO committee (id, name_nl, name_en, description_nl, description_en, created, updated)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Bestuur', 'Board', 'Het bestuur van de vereniging', 'The board of the association', now(), now()),
    ('22222222-2222-2222-2222-222222222222', 'Klimcommissie', 'Climbing Committee', 'Verantwoordelijk voor klimactiviteiten', 'Responsible for climbing activities', now(), now());

-- Users assigned to committees
INSERT INTO user_committee (id, committee_id, user_id, role, joined, "left")
VALUES
    ('24e2256c-4612-4774-a8ce-168c7817fbd4', '11111111-1111-1111-1111-111111111111', '1fcffdcc-be86-4f86-9567-9cc48f4bc9bf', 'member', '2024-11-11 13:14:17.997000 +00:00', '2024-11-11 13:14:17.997000 +00:00'),
    ('24e2256c-4612-4774-a8ce-168c7817fbd5', '11111111-1111-1111-1111-111111111111', '1fcffdcc-be86-4f86-9567-9cc48f4bc9bf', 'member', now(), NULL),
    ('24e2256c-4612-4774-a8ce-168c7817fbd6', '11111111-1111-1111-1111-111111111111', '30269618-160d-4a56-83af-7fc0c1996235', 'chair', now(), NULL),
    ('24e2256c-4612-4774-a8ce-168c7817fbd7', '22222222-2222-2222-2222-222222222222', '1fcffdcc-be86-4f86-9567-9cc48f4bc9bf', 'member', now(), NULL);
