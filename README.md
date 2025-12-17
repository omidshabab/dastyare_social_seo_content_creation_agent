# Dastyare Social SEO Content Agent (Express + Drizzle + Postgres)

Single-process app that serves a Persian RTL SPA and a REST API. Users log in with a 5‑digit OTP sent via IPPanel, manage credits, then stream SEO article generation in real time via OpenAI using SSE — title → intro → table of contents (H2/H3) → sections → conclusion → optional FAQ.

## Features
- OTP login via IPPanel (SMS)
- User credits: check and charge
- Step-by-step input flow, then real-time content streaming
- Persian RTL UI, no shadows, custom font (`Vazirmatn`)
- One server for both API and frontend

## Tech
- `express`, `drizzle-orm`, `pg`, `typescript`
- `openai` Responses API for streaming
- Static SPA in `public/` (HTML/CSS/JS)

## Prerequisites
- Node.js 18+
- A reachable Postgres database (create the database yourself)
- IPPanel Edge API key and originator number
- OpenAI API key

## Setup
1) Install dependencies
```
npm install
```
2) Configure environment
- Copy `.env.example` to `.env` and fill values
```
cp .env.example .env
```
3) Create database (example)
```
# Example using psql
psql -U postgres -c 'CREATE DATABASE mydb;'
```
4) Run migrations
```
npm run drizzle:migrate
```
5) Start in development (serves UI and API)
```
npm run dev
```
6) Access the UI
```
http://localhost:8080/
```

## Production
```
npm run build
npm run start
```

## Environment
Required vars (see `.env.example`):
- `PORT` — default `8080`
- `DATABASE_URL` — e.g. `postgres://USER:PASS@HOST:5432/DBNAME`
- `OPENAI_API_KEY` — your OpenAI key
- `IPPANEL_API_KEY` — your IPPanel Edge API key
- `IPPANEL_ORIGINATOR` — your sender number, e.g. `+981000xxxx`
- `IPPANEL_BASE_URL` — default `https://edge.ippanel.com/v1`
- `CONTENT_COST` — credits consumed per content (default `1`)

## How It Works
- Static SPA is served from `public/` in `src/server/index.ts` and is Persian RTL.
- OTP login:
  - `POST /api/auth/request-otp` sends SMS code to phone
  - `POST /api/auth/verify-otp` verifies code and returns `token`
- Credits:
  - `GET /api/credit?token=...` returns credit balance
  - `POST /api/credit/charge?token=...` with `{amount}` increases credits
- Content streaming (SSE):
  - `GET /api/content/stream?token=...&topic=...&keywords=...&tone=...&faq=yes`
  - Emits `title`, `intro`, `toc`, `sections`, `conclusion`, `faq` events

## curl Examples
- Request OTP
```
curl -X POST 'http://localhost:8080/api/auth/request-otp' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+98912XXXXXXX"}'
```
- Verify OTP, receive `token`
```
curl -X POST 'http://localhost:8080/api/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+98912XXXXXXX","code":"12345"}'
```
- Check credits
```
curl 'http://localhost:8080/api/credit?token=YOUR_SESSION_TOKEN'
```
- Charge credits (+5)
```
curl -X POST 'http://localhost:8080/api/credit/charge?token=YOUR_SESSION_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"amount":5}'
```
- Stream content (live)
```
curl -N 'http://localhost:8080/api/content/stream?token=YOUR_SESSION_TOKEN&topic=سئو&keywords=سئو,تولید%20محتوا&tone=رسمی&faq=yes'
```

## Important Code
- Server and static serving: `src/server/index.ts`
- OTP flow: `src/server/routes/auth.ts`
- Credits: `src/server/routes/credit.ts`
- Content stream (SSE): `src/server/routes/content.ts`
- Session middleware: `src/server/middleware/auth.ts`
- DB client: `src/server/db/client.ts`
- DB schema: `src/server/db/schema.ts`
- IPPanel SMS: `src/server/services/ippanel.ts`

## Notes
- Make sure your `DATABASE_URL` points to an existing database.
- If port `8080` is busy, set `PORT` in `.env` to another value.
