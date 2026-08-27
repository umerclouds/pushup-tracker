# CLAUDE.md — Team Push-Up Tracker

Context and instructions for working on this project. Read this fully before acting.

## What this is
A small **Node/Express** web app: a shared push-up challenge tracker for a cricket
team doing the Cancer Research UK "100 push-ups a day in September" challenge.
Everyone opens one public URL (no login, no accounts), logs their daily push-ups,
and sees a shared team leaderboard + combined total.

## Current deployment (already live)
- **Public URL:** https://pushup-tracker-production-bfd6.up.railway.app
- **Admin page:** https://pushup-tracker-production-bfd6.up.railway.app/admin
- **GitHub:** https://github.com/umerclouds/pushup-tracker (branch `main`)
- **Railway:** project `pushup-tracker` (workspace "Centre hq's Projects"),
  single service, volume `pushup-tracker-volume` mounted at `/data`,
  `ADMIN_TOKEN` env var set. To ship changes: `railway up` (pass `--service pushup-tracker`
  if prompted about multiple services).

## Stack & structure
- `server.js` — Express server: REST API + serves the static frontend. Persists data
  to a JSON file with atomic writes. Single process only.
- `public/index.html` — the main frontend (HTML/CSS/JS in one file, **no build step**):
  join screen, daily tracker, September-only leaderboard, player profile modal
  (September calendar + stats + achievement badges), fundraising card, WhatsApp share.
- `public/admin.html` — token-gated admin page (one file, no build step).
- `package.json` — start script is `node server.js`; needs **Node >= 18**.
- Data is stored at `${DATA_DIR}/db.json`. **`DATA_DIR` defaults to `/data`.**
  Shape: `{ members: { id: { name, log: { "YYYY-MM-DD": n } } }, donations: { target, raised } }`.
- The Cancer Research UK donate link is baked into the frontend.

## Environment variables
- `PORT` — injected by Railway; app reads it (default 3000). Never hardcode.
- `DATA_DIR` — defaults to `/data`; must match the Railway volume mount path.
- `ADMIN_TOKEN` — enables the admin API + `/admin` page. If unset, admin is disabled
  (403). Rotate with `railway variables --set "ADMIN_TOKEN=<new>"` + redeploy.
  Never commit the token to the repo (it's public).

## API (reference)
Public:
- `GET  /api/state` → `{ members: [{ id, name, log }], donations: { target, raised } }`
  (also a cheap health check)
- `POST /api/join`  → `{ id, name }`
- `POST /api/add`   → `{ id, name, amount, date }` (date = `YYYY-MM-DD`, increments that day)
- `POST /api/reset` → `{ id, date }` (zeroes that day)

Admin (require header `x-admin-token: $ADMIN_TOKEN`):
- `POST /api/admin/verify`    → `{}` (token check)
- `POST /api/admin/rename`    → `{ id, name }`
- `POST /api/admin/remove`    → `{ id }` (deletes the member)
- `POST /api/admin/setday`    → `{ id, date, amount }` (sets, not adds)
- `POST /api/admin/donations` → `{ target, raised }`

The admin API is the preferred way to fix or clear data — it updates both the running
process and the JSON file, so no redeploy is needed.

## Run locally (sanity check before deploy)
```bash
npm install
npm start                      # listens on $PORT (default 3000)
curl localhost:3000/api/state  # expect members + donations JSON
```
Set `ADMIN_TOKEN` and `DATA_DIR` locally when testing admin endpoints.

## Deploy changes
1. Test locally (above).
2. `railway up` from the project root (add `--service pushup-tracker` if asked).
3. Verify `https://<domain>/api/state` returns JSON and the site loads.
4. Commit and push to GitHub — the repo is the source of truth; Railway deploys
   are from the local directory, not the repo.

## Frontend conventions
- Leaderboard, hero team total, and the share text count **September push-ups only**
  (`sumSept`); player profiles also show an all-time total (`sumLog`).
- Client identity lives in `localStorage` key `pushup-me`; the admin token for the
  session in `sessionStorage` key `pushup-admin-token`.
- September year = current calendar year (`septYear()` in index.html).

## Gotchas
- Do **not** commit `node_modules/` or `data/` (already in `.gitignore`).
- Do **not** hardcode a port — the app must bind `process.env.PORT` (it does).
- Keep **one instance / replica only** — the JSON store assumes a single running process.
- No database service is required; the volume + JSON file is the whole storage layer.
- The Railway CLI occasionally drops connections (`os error 10054`) — retry the command.
- The Railway CLI refuses to let agents delete volume files; use the admin API to fix
  data, or upload an empty `{"members":{}}` db.json + redeploy as a last resort.
