# 🏏 Team Push-Up Challenge Tracker

A shared push-up tracker for a cricket team doing the **Cancer Research UK
"100 push-ups a day in September"** challenge. One public link, no logins:
everyone logs their daily push-ups and watches the shared team total climb.

**Live:** https://pushup-tracker-production-bfd6.up.railway.app
**Admin:** https://pushup-tracker-production-bfd6.up.railway.app/admin

## Features

- **Shared leaderboard** — today's push-ups for every teammate (medals for the top three),
  with a small last-7-days history under each name; the hero team total is also today-only.
- **Daily tracker** — quick-add buttons (+10/+20/+25/+50), custom amounts, daily 100 target
  with progress bar, and a day streak counter.
- **Player profiles** — tap any name on the leaderboard for their September daily calendar,
  stats (Sept total, best day, streak, ton days) and achievement badges
  (First ton, 150 club, Perfect week, 1,000/2,000 clubs, Full 3,000).
- **Fundraising card** — shows the amount raised for CRUK against a target, with a progress
  bar. Figures are updated manually from the admin page.
- **Admin page** (`/admin`, token-protected) — rename or remove members, add missed
  push-ups to any member's past day (**Add**) or overwrite a day's count (**Set**),
  and update the donation figures.
- **WhatsApp share** — one tap shares the current standings.

## Stack

- `server.js` — Node/Express: REST API + static frontend. Persists to a JSON file
  (atomic writes, single process). No database.
- `public/index.html` — the whole frontend in one file, no build step.
- `public/admin.html` — the admin page, also a single file.
- Node >= 18, one dependency (`express`).

## Run locally

```bash
npm install
npm start                      # listens on $PORT (default 3000)
curl localhost:3000/api/state  # {"members":[],"donations":{...}}
```

Environment variables:

| Variable      | Default | Purpose                                            |
|---------------|---------|----------------------------------------------------|
| `PORT`        | `3000`  | HTTP port (Railway injects this automatically)     |
| `DATA_DIR`    | `/data` | Where `db.json` lives (falls back to `./data`)     |
| `ADMIN_TOKEN` | unset   | Enables `/admin` + admin API. Unset = admin disabled |

## API

Public:

| Endpoint          | Method | Body                          | Notes                        |
|-------------------|--------|-------------------------------|------------------------------|
| `/api/state`      | GET    | —                             | `{ members, donations }`     |
| `/api/join`       | POST   | `{ id?, name }`               | Creates/updates a member     |
| `/api/add`        | POST   | `{ id, name, amount, date }`  | Increments that day's count  |
| `/api/reset`      | POST   | `{ id, date }`                | Zeroes that day              |

Admin — all require the `x-admin-token` header matching `ADMIN_TOKEN`:

| Endpoint               | Body                       | Purpose                       |
|------------------------|----------------------------|-------------------------------|
| `/api/admin/verify`    | `{}`                       | Token check                   |
| `/api/admin/rename`    | `{ id, name }`             | Rename a member               |
| `/api/admin/remove`    | `{ id }`                   | Delete a member entirely      |
| `/api/admin/setday`    | `{ id, date, amount }`     | Set (not add) a day's count   |
| `/api/admin/donations` | `{ target, raised }`       | Update fundraising figures    |

## Deployment (Railway)

Deployed on Railway with a **Volume mounted at `/data`** so the leaderboard survives
redeploys. Keep replicas at **1** — the JSON store assumes a single process.

```bash
railway up                 # deploy
railway variables --set "ADMIN_TOKEN=<secret>"   # rotate the admin token
```

See `CLAUDE.md` for the full deploy runbook.
