FROM node:22 AS frontend

WORKDIR /src
COPY ./frontend/package.json ./frontend/package-lock.json ./

RUN npm install

COPY ./frontend ./

RUN npm run build

FROM rust:1.90 AS backend

WORKDIR /src
COPY ./backend/ ./
COPY --from=frontend /src/dist/ /frontend/dist/

RUN cargo build --release

FROM debian:bookworm-slim AS final
RUN apt-get update && apt-get install curl -y

ARG version=development
ENV VERSION=$version

ARG user=nonroot
ARG group=nonroot
ARG uid=2000
ARG gid=2000
RUN addgroup --gid ${gid} ${group} && adduser --uid ${uid} --gid ${gid} --system --disabled-login --disabled-password ${user}
EXPOSE 3000

COPY --from=backend /src/target/release/nijsac-website-backend /home/nonroot/nijsac-website-backend

RUN chmod 777 /home/nonroot/nijsac-website-backend

USER $user

ENTRYPOINT ["./home/nonroot/nijsac-website-backend"]