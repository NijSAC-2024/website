# NijSAC Website

## Getting started
To spin up a simple development environment, run `docker compose up` and visit http://localhost:5173/.

## Apply fixtures

```shell
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/user.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/location.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/event.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/event_registration.sql
```
Windows
```shell
docker cp backend/src/data_source/fixtures website-db-1:/tmp/fixtures
```
```shell
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/event_registration.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/event.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/location.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/user.sql
```