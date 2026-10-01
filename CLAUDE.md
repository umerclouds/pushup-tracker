# CLAUDE.md — Triple-50 October Challenge Tracker

Context and instructions for working on this project. Read this fully before acting.

## What this is
A small **Node/Express** web app: a shared exercise tracker for a cricket team's
**October Triple-50 challenge** — 50 push-ups, 50 squats and 50 core reps, every
day in October (50 per exercise is the minimum; more is encouraged). Everyone opens
one shared URL (no login, no accounts), logs their daily reps per exercise, and
sees a shared team leaderboard + combined total.

This replaced the September "100 push-ups a day" challenge (v1). All September
data was wiped and the public + admin links were rotated for the new squad.

## Current deployment (already live)
- **Public + admin URLs:** see `ADMIN-ACCESS.md` (private, gitignored). Do **not**
  commit the live URL or the admin token to this repo — the repo is public and the
  URL is the only thing gating the app.
- **GitHub:** https://github.com/umerclouds/pushup-tracker (branch `main`)
- **Railway:** project `pushup-tracker` (workspace "Centre hq's Projects"),
  single service, volume `pushup-tracker-volume` mounted at `/data`,
  `ADMIN_TOKEN` env var set. To ship changes: `railway up` (pass `--service pushup-tracker`
  if prompted about multiple services). `railway domain list` shows the current live URL.

## Stack & structure
- `server.js` — Express server: REST API + serves the static frontend. Persists data
  to a JSON file with atomic writes. Single process only.
- `public/index.html` — the main frontend (HTML/CSS/JS in one file, **no build step**):
  join screen, three-exercise daily tracker, October leaderboard, player profile modal
  (October calendar + stats + achievement badges), WhatsApp share.
- `public/admin.html` — token-gated admin page (one file, no build step).
- `package.json` — start script is `node server.js`; needs **Node >= 18**.
- Data is stored at `${DATA_DIR}/db.json`. **`DATA_DIR` defaults to `/data`.**
  v2 shape:
  `{ version: 2, members: { id: { name, log: { "YYYY-MM-DD": { pushups, squats, core } } } } }`.
  On startup, a db.json without `version: 2` (the September data) is archived to
  `db-september-archive.json` in the same directory and the app starts empty.

## Environment variables
- `PORT` — injected by Railway; app reads it (default 3000). Never hardcode.
- `DATA_DIR` — defaults to `/data`; must match the Railway volume mount path.
- `ADMIN_TOKEN` — enables the admin API + `/admin` page. If unset, admin is disabled
  (403). Rotate with `railway variables --set "ADMIN_TOKEN=<new>"` + redeploy.
  Never commit the token to the repo (it's public). The current token lives in
  `ADMIN-ACCESS.md` (gitignored).

## API (reference)
Exercises are exactly `pushups`, `squats`, `core`; daily target is 50 each.

Public:
- `GET  /api/state` → `{ members: [{ id, name, log }], exercises, target }`
  (also a cheap health check)
- `POST /api/join`  → `{ id, name }`
- `POST /api/add`   → `{ id, name, exercise, amount, date }` (date = `YYYY-MM-DD`,
  increments that exercise for that day)
- `POST /api/reset` → `{ id, date, exercise? }` (zeroes the whole day, or one
  exercise if given)

Admin (require header `x-admin-token: $ADMIN_TOKEN`):
- `POST /api/admin/verify`  → `{}` (token check)
- `POST /api/admin/rename`  → `{ id, name }`
- `POST /api/admin/remove`  → `{ id }` (deletes the member)
- `POST /api/admin/setday`  → `{ id, date, pushups, squats, core }` (sets, not adds,
  the whole day; missing fields become 0)

The admin API is the preferred way to fix or clear data — it updates both the running
process and the JSON file, so no redeploy is needed.

## Run locally (sanity check before deploy)
```bash
npm install
npm start                      # listens on $PORT (default 3000)
curl localhost:3000/api/state  # expect members + exercises + target JSON
```
Set `ADMIN_TOKEN` and `DATA_DIR` locally when testing admin endpoints.

## Deploy changes
1. Test locally (above).
2. `railway up` from the project root (add `--service pushup-tracker` if asked).
3. Verify `https://<domain>/api/state` returns JSON and the site loads
   (`railway domain list` for the domain).
4. Commit and push to GitHub — the repo is the source of truth; Railway deploys
   are from the local directory, not the repo.

## Frontend conventions
- Leaderboard, hero team total, and the share text count **today's reps only**
  (log entry for `todayKey()`), with a small last-7-days history strip under the hero
  and under each leaderboard row. Leaderboard ranks by **targets hit today (0–3)**
  first, then total reps today, then October total. Player profiles show the full
  October calendar/stats (`sumOct`, gold day = all 3 targets hit) plus an all-time
  total (`sumLog`).
- Client identity lives in `localStorage` key `pushup-me`; the admin token for the
  session in `sessionStorage` key `pushup-admin-token`.
- October year = current calendar year (`octYear()` in index.html).
- Exercise icons used throughout: 💪 push-ups, 🦵 squats, 🧘 core.

## Gotchas
- Do **not** commit `node_modules/`, `data/`, or `ADMIN-ACCESS.md` (already in
  `.gitignore`).
- Do **not** hardcode a port — the app must bind `process.env.PORT` (it does).
- Keep **one instance / replica only** — the JSON store assumes a single running process.
- No database service is required; the volume + JSON file is the whole storage layer.
- The Railway CLI occasionally drops connections (`os error 10054`) — retry the command.
- The Railway CLI refuses to let agents delete volume files; use the admin API to fix
  data, or upload an empty `{"version":2,"members":{}}` db.json + redeploy as a last resort.
- `railway domain delete <domain> --yes` + `railway domain` regenerates the public URL
  (used for the October link rotation).
