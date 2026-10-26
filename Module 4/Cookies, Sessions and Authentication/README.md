# Session-based Authentication API

## Requirements and setup

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run setup
npm.cmd run dev
```

Replace `COOKIE_SECRET` in `.env` with a private random value of at least 32 characters. Keep `COOKIE_SECURE=false` for local HTTP. In production, cookies are always marked `Secure` and the API must be served over HTTPS. `SESSION_TTL_MS` controls both the cookie lifetime and server-side session expiry.

`npm.cmd run setup` generates the Prisma client, creates the local SQLite database, and seeds `sam@example.com` with password `SessionDemo!48`.

## Endpoints

- `POST /auth/login` - accepts `{ "email": "sam@example.com", "password": "SessionDemo!48" }`, creates a server-side session, sets the signed `sid` cookie, and returns safe user fields.
- `GET /auth/me` - returns the authenticated user's `id`, `name`, and `email` only when the signed cookie resolves to a live session and existing user.
- `POST /auth/logout` - destroys the server-side session and clears `sid`; repeated requests return `204`.

## Local verification

In PowerShell, start the server with `npm.cmd run dev`, then use a second terminal:

```powershell
'{"email":"sam@example.com","password":"SessionDemo!48"}' | Set-Content -NoNewline -Encoding ascii login.json
curl.exe -i -c cookies.txt -H "Content-Type: application/json" --data-binary "@login.json" http://localhost:3000/auth/login
curl.exe -i -b cookies.txt http://localhost:3000/auth/me
curl.exe -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
curl.exe -i -b cookies.txt http://localhost:3000/auth/me
curl.exe -i -H "Cookie: sid=invalid.signature" http://localhost:3000/auth/me
```

The login response must contain `Set-Cookie` with `sid`, `HttpOnly`, and `SameSite=Lax`; the final identity request must return `401`. The altered-cookie request must also return `401`. To verify `Secure`, set `$env:NODE_ENV = 'production'` before starting the API; use HTTPS because browsers and clients correctly omit Secure cookies over plain HTTP.

The included session store is an in-memory learning/local implementation. It loses sessions on restart and is not shared across API instances. Production deployments require a shared store with expiration, such as Redis.
