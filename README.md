# NijSAC Website

## Getting started
To spin up a simple development environment, run `docker compose up` and visit http://localhost:5173/.

## Apply fixtures
```shell
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/user.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/location.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/event.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/event_registration.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/pages.sql
```


