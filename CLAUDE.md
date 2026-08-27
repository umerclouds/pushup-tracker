# CLAUDE.md — Team Push-Up Tracker

Context and instructions for deploying this project. Read this fully before acting.

## What this is
A small **Node/Express** web app: a shared push-up challenge tracker for a cricket
team doing the Cancer Research UK "100 push-ups a day in September" challenge.
Everyone opens one public URL (no login, no accounts), logs their daily push-ups,
and sees a shared team leaderboard + combined total.

**The task:** deploy this to **Railway** and return the live public URL.

## Stack & structure
- `server.js` — Express server: REST API + serves the static frontend. Persists data to a JSON file.
- `public/index.html` — the entire frontend (HTML/CSS/JS in one file, **no build step**).
- `package.json` — start script is `node server.js`; needs **Node >= 18**.
- Data is stored at `${DATA_DIR}/db.json`. **`DATA_DIR` defaults to `/data`.**
- The Cancer Research UK donate link is already baked into the frontend — nothing to configure.

## API (reference)
- `GET  /api/state` → `{ members: [{ id, name, log }] }`  (also a cheap health check)
- `POST /api/join`  → `{ id, name }`
- `POST /api/add`   → `{ id, name, amount, date }`  (date = `YYYY-MM-DD`, increments that day)
- `POST /api/reset` → `{ id, date }`

## Run locally (sanity check before deploy)
```bash
npm install
npm start                      # listens on $PORT (default 3000)
curl localhost:3000/api/state  # expect: {"members":[]}
```

## Deploy to Railway — step by step
Do these in order. Some steps need the user (browser auth); pause and tell them when so.

1. **Ensure the CLI:** `railway --version` — if missing, `npm i -g @railway/cli`.
2. **Log in:** `railway login` (opens a browser; the user must complete it).
3. **Create the project** from the project root: `railway init`
   (name it `pushup-tracker`, or ask the user for a preferred name).
4. **Deploy:** `railway up` — uploads the code; Railway auto-detects Node and runs `npm start`.
5. **Public domain:** `railway domain` — generates and prints the `*.up.railway.app` URL. This is the link to share.
6. **Persistence — attach a Volume at `/data`** (critical, or the leaderboard resets on every redeploy):
   - Check what the installed CLI supports: `railway volume --help`.
   - If it supports it, add a volume mounted at **`/data`** (e.g. `railway volume add` and follow the prompts / flags for mount path `/data`).
   - If the CLI **cannot** create a volume, tell the user to do it in the dashboard:
     **Service → Settings → Volumes → New Volume → mount path `/data`**, then run `railway up` again.
   - If for any reason the volume is mounted at a different path, set the env var to match:
     `railway variables set DATA_DIR=/your/mount/path` and redeploy.
7. **No other env vars are needed** — Railway injects `PORT` automatically and the app reads it.

## Definition of done (verify all of these)
- `curl https://<domain>/api/state` returns JSON (e.g. `{"members":[...]}`).
- Opening `https://<domain>` shows the "Join the challenge" screen; entering a name and tapping a `+` button updates the leaderboard and the team total.
- **Persistence proof:** log some push-ups, run `railway up` again, then reload — the data is still there. If it resets, the volume isn't mounted where `DATA_DIR` points; fix step 6 and redeploy.
- **Print the final public URL clearly** at the end so it can be shared in WhatsApp.

## Gotchas
- Do **not** commit `node_modules/` or `data/` (already in `.gitignore`).
- Do **not** hardcode a port — the app must bind `process.env.PORT` (it does).
- Keep **one instance only** — the JSON store assumes a single running process. Do not scale replicas above 1.
- No database service is required; the volume + JSON file is the whole storage layer.
