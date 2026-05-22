# NijSAC Website

## Getting started
To spin up a simple development environment, run `docker compose up` and visit http://localhost:5173/.

## Apply fixtures

```shell
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/user.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/location.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/committee.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/event.sql
psql -h localhost -U nijsac -d nijsac < backend/src/data_source/fixtures/event_registration.sql
```
Windows
```shell
docker exec website-db-1 rm -rf /tmp/fixtures
```
```shell
docker exec website-db-1 mkdir -p /tmp/fixtures
docker cp backend/src/data_source/fixtures/. website-db-1:/tmp/fixtures
```
```shell
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/user.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/location.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/committee.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/event.sql
docker exec -i website-db-1 psql -U nijsac -d nijsac -f /tmp/fixtures/event_registration.sql
```

Update Rust version inside docker
```shell
docker exec -i website-backend-1 curl https://sh.rustup.rs -sSf | sh -s -- -y
docker exec -i website-backend-1 rustup install stable
docker exec -i website-backend-1 rustup default stable
docker exec -i website-backend-1 rustc --version
```

Typescript errors
```shell
cd frontend
npx tsc --noEmit
```