INSERT INTO activity (id, location_id, name_nl, name_en, description_nl, description_en,
                      registration_start, registration_end, registration_max, waiting_list_max, created, updated,
                      activity_type, questions, metadata)
VALUES ('24e2256c-4612-4774-a8ce-168c7817fbd4',
        '774f958d-4504-46a7-b3bf-c29fde52e332',
        'activiteit naam',
        'activity name',
        'Beschrijving activiteit',
        'description activity',
        '2024-11-11 13:14:17.997000 +00:00',
        '2025-01-01 13:14:17.997000 +00:00',
        '10',
        '9',
        '2024-11-01 13:14:17.997000 +00:00',
        '2024-11-01 13:14:17.997000 +00:00',
        'activity',
        '[
          {
            "id": "24e2256c-4612-4774-a8ce-168c7817fbd4",
            "question_en": "What is your favorite color?",
            "question_nl": "Wat is je favoriete kleur?",
            "question_type": "short_text",
            "required": false
          }
        ]',
        '[]');


INSERT INTO date (activity_id, start, "end")
VALUES ('24e2256c-4612-4774-a8ce-168c7817fbd4',
        '2025-01-10 13:14:17.997000 +00:00',
        '2025-01-11 13:14:17.997000 +00:00');