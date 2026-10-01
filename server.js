const express = require('express');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

const app = express();
app.use(express.json({ limit: '256kb' }));

/* ---------- data directory ----------
   On Railway, attach a Volume mounted at /data so the leaderboard
   survives restarts and redeploys. Falls back to a local ./data
   folder (ephemeral) if /data isn't available. */
let DATA_DIR = process.env.DATA_DIR || '/data';
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.accessSync(DATA_DIR, fs.constants.W_OK);
} catch (e) {
  DATA_DIR = path.join(__dirname, 'data');
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'db.json');
const TMP_FILE = DB_FILE + '.tmp';

/* ---------- load ----------
   v2 schema (October challenge): each day holds three exercises.
   { version: 2, members: { id: { name, log: { "YYYY-MM-DD": { pushups, squats, core } } } } }
   A v1 (September) db.json found on the volume is archived untouched and the
   app starts with an empty roster. */
const EXERCISES = ['pushups', 'squats', 'core'];
let db = { version: 2, members: {} };
try {
  const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (parsed && typeof parsed === 'object') {
    if (parsed.version === 2) {
      db = parsed;
      if (!db.members) db.members = {};
    } else {
      try { fs.renameSync(DB_FILE, path.join(DATA_DIR, 'db-september-archive.json')); }
      catch (e) { console.error('archive of v1 db failed:', e.message); }
    }
  }
} catch (e) { /* no db yet — start fresh */ }

/* ---------- atomic write queue ---------- */
let chain = Promise.resolve();
function persist() {
  chain = chain
    .then(async () => {
      await fsp.writeFile(TMP_FILE, JSON.stringify(db));
      await fsp.rename(TMP_FILE, DB_FILE);
    })
    .catch(err => console.error('persist error:', err));
  return chain;
}

/* ---------- helpers ---------- */
function slug(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}
function clampAmt(n) {
  n = Math.floor(Number(n));
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(100000, n));
}
function cleanName(s) { return String(s || '').trim().slice(0, 24); }
function validDate(d) { return /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')); }
function validExercise(e) { return EXERCISES.includes(e); }
function dayObj(v) {
  const o = {};
  for (const ex of EXERCISES) o[ex] = clampAmt(v && v[ex]);
  return o;
}
function upsert(id, name) {
  if (!db.members[id]) db.members[id] = { name: name || 'Player', log: {} };
  else if (name) db.members[id].name = name;
  if (!db.members[id].log) db.members[id].log = {};
  return db.members[id];
}

/* ---------- API ---------- */
app.get('/api/state', (req, res) => {
  const members = Object.entries(db.members).map(([id, m]) => ({
    id, name: m.name, log: m.log || {}
  }));
  res.json({ members, exercises: EXERCISES, target: 50 });
});

app.post('/api/join', async (req, res) => {
  const name = cleanName(req.body.name);
  const id = slug(req.body.id) || slug(name);
  if (!id || !name) return res.status(400).json({ error: 'name required' });
  upsert(id, name);
  await persist();
  res.json({ ok: true, id });
});

app.post('/api/add', async (req, res) => {
  const name = cleanName(req.body.name);
  const id = slug(req.body.id) || slug(name);
  const exercise = String(req.body.exercise || '');
  const amount = clampAmt(req.body.amount);
  const date = validDate(req.body.date) ? req.body.date : null;
  if (!id || !date || !validExercise(exercise)) return res.status(400).json({ error: 'bad request' });
  const m = upsert(id, name);
  const day = dayObj(m.log[date]);
  day[exercise] = clampAmt(day[exercise] + amount);
  m.log[date] = day;
  await persist();
  res.json({ ok: true });
});

/* Resets the whole day, or a single exercise if one is given. */
app.post('/api/reset', async (req, res) => {
  const id = slug(req.body.id);
  const date = validDate(req.body.date) ? req.body.date : null;
  const exercise = req.body.exercise ? String(req.body.exercise) : null;
  if (!id || !date || !db.members[id]) return res.status(400).json({ error: 'bad request' });
  if (exercise && !validExercise(exercise)) return res.status(400).json({ error: 'bad request' });
  const day = dayObj(db.members[id].log[date]);
  if (exercise) day[exercise] = 0;
  else for (const ex of EXERCISES) day[ex] = 0;
  db.members[id].log[date] = day;
  await persist();
  res.json({ ok: true });
});

/* ---------- admin ----------
   Enabled only when ADMIN_TOKEN is set in the environment.
   Every admin request must carry the token in the x-admin-token header. */
function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return res.status(403).json({ error: 'admin disabled — set ADMIN_TOKEN env var' });
  if (req.get('x-admin-token') !== token) return res.status(401).json({ error: 'invalid token' });
  next();
}

app.post('/api/admin/verify', requireAdmin, (req, res) => res.json({ ok: true }));

app.post('/api/admin/rename', requireAdmin, async (req, res) => {
  const id = slug(req.body.id);
  const name = cleanName(req.body.name);
  if (!id || !name || !db.members[id]) return res.status(400).json({ error: 'bad request' });
  db.members[id].name = name;
  await persist();
  res.json({ ok: true });
});

app.post('/api/admin/remove', requireAdmin, async (req, res) => {
  const id = slug(req.body.id);
  if (!id || !db.members[id]) return res.status(400).json({ error: 'bad request' });
  delete db.members[id];
  await persist();
  res.json({ ok: true });
});

/* Sets (not adds) all three exercises for a member's day. */
app.post('/api/admin/setday', requireAdmin, async (req, res) => {
  const id = slug(req.body.id);
  const date = validDate(req.body.date) ? req.body.date : null;
  if (!id || !date || !db.members[id]) return res.status(400).json({ error: 'bad request' });
  if (!db.members[id].log) db.members[id].log = {};
  db.members[id].log[date] = dayObj(req.body);
  await persist();
  res.json({ ok: true });
});

/* ---------- static frontend ---------- */
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Triple-50 tracker running on ${PORT} — data dir: ${DATA_DIR}`));
