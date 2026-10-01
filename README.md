# 🏏 Triple-50 October Challenge Tracker

A shared exercise tracker for a cricket team's **October Triple-50 challenge**:
**50 push-ups, 50 squats and 50 core reps — every day**. More than 50 is welcome;
50 per exercise is the daily minimum. One public link, no logins: everyone logs
their daily reps and watches the shared team total climb.

> The live and admin URLs are private to the team — see `ADMIN-ACCESS.md` (not committed).

## Features

- **Shared leaderboard** — ranked by **targets hit today (0–3)**, then total reps.
  Each row shows per-exercise chips (💪 🦵 🧘, gold ✓ at 50+) and today's reps;
  medals for the top three.
- **Daily tracker** — three exercise cards, each with a 50-rep progress bar,
  quick-add buttons (+10/+25/+50) and a custom amount. Three target dots show
  how much of the day is done; a streak counter tracks consecutive active days.
- **Player profiles** — tap any name for their October calendar (gold = all 3
  targets hit), stat tiles (targets today, best day, streak, full days),
  per-exercise totals and achievement badges (First triple, Century, Perfect
  week, 1,500/3,000 clubs, Full 4,650).
- **Admin page** (`/admin`, token-protected) — rename or remove members, add
  missed reps to any member's past day (**Add**) or overwrite a whole day
  (**Set**), plus an October summary table and a copyable WhatsApp team update.
- **WhatsApp share** — one tap shares the current standings.

## Stack

- `server.js` — Node/Express: REST API + static frontend. Persists to a JSON file
  (atomic writes, single process). No database.
- `public/index.html` — the whole frontend in one file, no build step.
- `public/admin.html` — the admin page, also a single file.
- Node >= 18, one dependency (`express`).

## Data model (v2)

```json
{
  "version": 2,
  "members": {
    "player-id": {
      "name": "Player",
      "log": { "2026-10-01": { "pushups": 50, "squats": 50, "core": 50 } }
    }
  }
}
```

A v1 (September) `db.json` found on startup is archived to
`db-september-archive.json` and the app starts with an empty roster.

## Run locally

```bash
npm install
npm start                      # listens on $PORT (default 3000)
curl localhost:3000/api/state  # {"members":[],"exercises":[...],"target":50}
```

Environment variables:

| Variable      | Default | Purpose                                            |
|---------------|---------|----------------------------------------------------|
| `PORT`        | `3000`  | HTTP port (Railway injects this automatically)     |
| `DATA_DIR`    | `/data` | Where `db.json` lives (falls back to `./data`)     |
| `ADMIN_TOKEN` | unset   | Enables `/admin` + admin API. Unset = admin disabled |

## API

Public:

| Endpoint     | Method | Body                                    | Notes                                  |
|--------------|--------|-----------------------------------------|----------------------------------------|
| `/api/state` | GET    | —                                       | `{ members, exercises, target }`       |
| `/api/join`  | POST   | `{ id?, name }`                         | Creates/updates a member               |
| `/api/add`   | POST   | `{ id, name, exercise, amount, date }`  | Increments one exercise for that day   |
| `/api/reset` | POST   | `{ id, date, exercise? }`               | Zeroes the day (or one exercise)       |

`exercise` is one of `pushups`, `squats`, `core`.

Admin — all require the `x-admin-token` header matching `ADMIN_TOKEN`:

| Endpoint            | Body                                   | Purpose                            |
|---------------------|----------------------------------------|------------------------------------|
| `/api/admin/verify` | `{}`                                   | Token check                        |
| `/api/admin/rename` | `{ id, name }`                         | Rename a member                    |
| `/api/admin/remove` | `{ id }`                               | Delete a member entirely           |
| `/api/admin/setday` | `{ id, date, pushups, squats, core }`  | Set (not add) a whole day          |

## Deployment (Railway)

Deployed on Railway with a **Volume mounted at `/data`** so the leaderboard survives
redeploys. Keep replicas at **1** — the JSON store assumes a single process.

```bash
railway up                 # deploy
railway variables --set "ADMIN_TOKEN=<secret>"   # rotate the admin token
```

See `CLAUDE.md` for the full deploy runbook.
