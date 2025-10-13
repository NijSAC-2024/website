INSERT INTO event (id, location_id, name_nl, name_en, description_nl, description_en,
                      registration_start, registration_end, registration_max, waiting_list_max, created_by,
                      created, updated, event_type, questions, metadata, start_dates, end_dates)
VALUES ('24e2256c-4612-4774-a8ce-168c7817fbd4',
        '774f958d-4504-46a7-b3bf-c29fde52e332',
        'event naam',
        'event name',
        'Beschrijving event',
        'description event',
        '2024-11-11 13:14:17.997000 +00:00',
        '2025-01-01 13:14:17.997000 +00:00',
        '10',
        '9',
        '11111111-1111-1111-1111-111111111111',
        '2024-11-01 13:14:17.997000 +00:00',
        '2024-11-01 13:14:17.997000 +00:00',
        'activity',
        '[
          {
            "id": "24e2256c-4612-4774-a8ce-168c7817fbd4",
            "question": {
              "en": "What is your favorite color?",
              "nl": "Wat is je favoriete kleur?"
            },
            "questionType": {
              "type": "multipleChoice",
              "options": [
                {
                  "en": "Red",
                  "nl": "Rood"
                },
                {
                  "en": "Green",
                  "nl": "Groen"
                },
                {
                  "en": "Blue",
                  "nl": "Blauw"
                },
                {
                  "en": "Yellow",
                  "nl": "Geel"
                },
                {
                  "en": "Black",
                  "nl": "Zwart"
                },
                {
                  "en": "White",
                  "nl": "Wit"
                },
                {
                  "en": "Other",
                  "nl": "Andere"
                }
              ]
            },
            "required": true
          }
        ]',
        '[]',
        '{"2025-01-10 13:14:17.997000 +00:00"}',
        '{"2025-01-11 13:14:17.997000 +00:00"}');
