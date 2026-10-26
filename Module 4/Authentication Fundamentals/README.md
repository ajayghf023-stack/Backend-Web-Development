# Authentication Fundamentals API

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm start
```

In PowerShell, use `Copy-Item .env.example .env` instead of the `cp` command. The SQLite datasource keeps local setup self-contained. Do not commit `.env` or `prisma/dev.db`.

## Endpoints

- `POST /auth/register`
- `POST /auth/login`

Registration accepts `{ "name": "Sam", "email": "sam@example.com", "password": "your password" }`, stores an asynchronous bcrypt hash, and responds with `201` and only the user's `id`, `name`, and normalized `email`. A normalized duplicate email responds with `409`.

Login accepts `{ "email": "sam@example.com", "password": "your password" }` and responds with `200` and only the user's `id`, `name`, and `email`. Unknown emails and incorrect passwords both respond with `401` and the same `INVALID_CREDENTIALS` error. Malformed or missing fields respond with `400`; unexpected server errors return a generic `500`.

Set `DATABASE_URL`, `PORT`, and `BCRYPT_COST` in `.env` as needed. Passwords and hashes are never included in API responses.
