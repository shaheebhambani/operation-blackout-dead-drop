import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const {
  ADMIN_KEY = 'change_me',
  FINAL_ROOM = '204',
  COUNTDOWN_MINUTES = '5',
  TEAM_COUNT = '20',
  PORT = 3001
} = process.env;

// File-based persistence intentionally avoids native SQLite compilation so this
// project works out-of-the-box on Windows with modern Node.js versions.
const dbFile = path.join(__dirname, 'blackout.json');
const emptyDb = () => ({ teams: [], sessions: {}, clearance_codes: {}, admin_verifications: [] });
let db;
try {
  db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')) : emptyDb();
} catch {
  db = emptyDb();
}

db.teams ||= [];
db.sessions ||= {};
db.clearance_codes ||= {};
db.admin_verifications ||= [];

const saveDb = () => {
  const tmp = `${dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, dbFile);
};

for (let i = 1; i <= Number(TEAM_COUNT); i++) {
  const id = `TEAM-${String(i).padStart(2, '0')}`;
  if (!db.teams.includes(id)) db.teams.push(id);
}
saveDb();

const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const pick = n => Array.from({ length: n }, () => AL[crypto.randomInt(AL.length)]).join('');
function newCode() {
  for (;;) {
    const c = `BLK-${pick(4)}-${pick(2)}`;
    if (!Object.values(db.clearance_codes).some(x => x.code === c)) return c;
  }
}

const countdownMs = Number(COUNTDOWN_MINUTES) * 60000;
const normTeam = t => String(t || '').trim().toUpperCase();
const now = () => Date.now();

function details(teamId) {
  const s = db.sessions[teamId];
  const c = db.clearance_codes[teamId];
  if (!s?.completed_at || !c) return { teamId, completed: false };
  return {
    teamId,
    completed: true,
    room: c.room_number,
    code: c.code,
    countdownStart: s.countdown_start,
    countdownMs,
    serverNow: now()
  };
}

const app = express();
app.use(express.json());

app.post('/api/session', (req, res) => {
  const teamId = normTeam(req.body.teamId);
  if (!db.teams.includes(teamId)) return res.status(404).json({ error: 'UNKNOWN TEAM ID' });
  if (!db.sessions[teamId]) {
    db.sessions[teamId] = { team_id: teamId, created_at: now(), completed_at: null, countdown_start: null };
    saveDb();
  }
  res.json(details(teamId));
});

app.post('/api/complete', (req, res) => {
  const teamId = normTeam(req.body.teamId);
  const s = db.sessions[teamId];
  if (!s) return res.status(400).json({ error: 'NO SESSION' });
  if (!s.completed_at) {
    const stamp = now();
    s.completed_at = stamp;
    s.countdown_start = stamp;
    db.clearance_codes[teamId] = {
      team_id: teamId,
      code: newCode(),
      room_number: String(FINAL_ROOM),
      created_at: stamp,
      verified_at: null,
      status: 'READY'
    };
    saveDb();
  }
  res.json(details(teamId));
});

const admin = express.Router();
admin.use((req, res, next) => (
  req.get('x-admin-key') === ADMIN_KEY ? next() : res.status(401).json({ error: 'UNAUTHORIZED' })
));

admin.get('/teams', (_req, res) => {
  const rows = db.teams.map(team_id => {
    const c = db.clearance_codes[team_id];
    const s = db.sessions[team_id];
    return {
      team_id,
      code: c?.code || null,
      room_number: c?.room_number || null,
      status: c?.status || 'NOT STARTED',
      verified_at: c?.verified_at || null,
      completed_at: s?.completed_at || null
    };
  });
  res.json(rows);
});

admin.post('/verify', (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const c = Object.values(db.clearance_codes).find(x => x.code === code);
  db.admin_verifications.push({ code, valid: c ? 1 : 0, at: now() });
  saveDb();
  res.json(c
    ? { valid: true, team: c.team_id, status: c.status, clearedAt: c.created_at }
    : { valid: false });
});

admin.post('/mark', (req, res) => {
  const teamId = normTeam(req.body.teamId);
  if (db.clearance_codes[teamId]) {
    db.clearance_codes[teamId].status = 'VERIFIED';
    db.clearance_codes[teamId].verified_at = now();
    saveDb();
  }
  res.json({ ok: true });
});

admin.post('/reset', (req, res) => {
  const teamId = normTeam(req.body.teamId);
  delete db.clearance_codes[teamId];
  delete db.sessions[teamId];
  saveDb();
  res.json({ ok: true });
});

admin.post('/regenerate', (req, res) => {
  const teamId = normTeam(req.body.teamId);
  if (!db.clearance_codes[teamId]) return res.status(404).json({ error: 'NO CLEARANCE CODE' });
  db.clearance_codes[teamId].code = newCode();
  db.clearance_codes[teamId].status = 'READY';
  db.clearance_codes[teamId].verified_at = null;
  saveDb();
  res.json({ ok: true });
});

app.use('/api/admin', admin);

const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`BLACKOUT API on http://localhost:${PORT}`));
