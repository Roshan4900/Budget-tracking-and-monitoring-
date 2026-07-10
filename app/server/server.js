/* ============================================================
   server.js — the web server
   ------------------------------------------------------------
   Serves the static website (../public) AND the JSON API on the
   same origin, so the login cookie is first-party (no CORS).

   Public:   GET  /api/data            all data for the site
             GET  /api/datasets        schema + row counts
   Auth:     POST /api/auth/login      log in (rate limited)
             POST /api/auth/logout     log out
             GET  /api/auth/me         current admin
   Admin:    POST /api/admin/upload/:dataset   replace a dataset from CSV
             GET  /api/admin/uploads           recent upload history
============================================================ */
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const {
  DATASETS, isDataset, countRows, getAllData, replaceDataset, logUpload, recentUploads,
} = require('./db');
const {
  COOKIE_NAME, cookieOptions, verifyAdmin, issueToken, requireAdmin,
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// security headers. CSP is disabled so the site's inline styles/scripts
// keep working out of the box — tighten this for production (see the guide).
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cookieParser());

// ---------- small helper for clean error messages ----------
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// ---------- CSV -> validated rows ----------
function parseCsvToRows(datasetName, buffer) {
  const ds = DATASETS[datasetName];
  let records;
  try {
    records = parse(buffer.toString('utf8'), {
      columns: true, skip_empty_lines: true, trim: true, bom: true,
    });
  } catch (e) {
    throw new HttpError(400, 'Could not read the CSV file: ' + e.message);
  }
  if (!records.length) throw new HttpError(400, 'The CSV file has no data rows.');

  const header = Object.keys(records[0]);
  const missing = ds.columns.filter((c) => !header.includes(c));
  if (missing.length) {
    throw new HttpError(400,
      `CSV is missing required column(s): ${missing.join(', ')}. Expected header: ${ds.columns.join(', ')}.`);
  }

  const numeric = new Set(ds.numeric);
  const labelCol = ds.columns[0]; // "name" or "goal" — must not be empty

  return records.map((rec, i) => {
    const rowNo = i + 2; // header is line 1
    const row = {};
    for (const c of ds.columns) {
      let v = rec[c];
      if (numeric.has(c)) {
        if (v === '' || v === undefined || v === null) {
          v = 0;
        } else {
          const n = Number(String(v).replace(/,/g, '').trim());
          if (Number.isNaN(n)) throw new HttpError(400, `Row ${rowNo}: "${c}" must be a number, but got "${rec[c]}".`);
          v = n;
        }
      } else {
        v = v === undefined || v === null ? '' : String(v).trim();
      }
      row[c] = v;
    }
    if (!row[labelCol]) throw new HttpError(400, `Row ${rowNo}: "${labelCol}" cannot be empty.`);
    return row;
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const ok = /\.csv$/i.test(file.originalname) ||
      ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain', 'application/octet-stream']
        .includes(file.mimetype);
    cb(ok ? null : new Error('Please upload a .csv file.'), ok);
  },
});

// ===================== PUBLIC API =====================
app.get('/api/data', (req, res) => {
  res.json(getAllData());
});

app.get('/api/datasets', (req, res) => {
  res.json(Object.entries(DATASETS).map(([name, ds]) => ({
    name, columns: ds.columns, numeric: ds.numeric, rows: countRows(name),
  })));
});

// ===================== AUTH =====================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                       // 20 attempts / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait a few minutes and try again.' },
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });
  const user = verifyAdmin(String(username), String(password));
  if (!user) return res.status(401).json({ error: 'Invalid username or password.' });
  res.cookie(COOKIE_NAME, issueToken(user), cookieOptions);
  res.json({ ok: true, user: { username: user.username, role: user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAdmin, (req, res) => {
  res.json({ user: { username: req.admin.username, role: req.admin.role } });
});

// ===================== ADMIN (protected) =====================
app.post('/api/admin/upload/:dataset', requireAdmin, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const name = req.params.dataset;
    if (!isDataset(name)) return res.status(404).json({ error: 'Unknown dataset: ' + name });
    if (!req.file) return res.status(400).json({ error: 'No file received (the form field must be named "file").' });
    try {
      const rows = parseCsvToRows(name, req.file.buffer);
      const count = replaceDataset(name, rows);
      logUpload(req.admin.id, name, count, req.file.originalname);
      res.json({ ok: true, dataset: name, rows: count });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message });
    }
  });
});

app.get('/api/admin/uploads', requireAdmin, (req, res) => {
  res.json(recentUploads(10));
});

// unknown API routes -> JSON 404 (instead of falling through to static)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ===================== STATIC SITE =====================
app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => {
  console.log(`\n  Budget app running:`);
  console.log(`  • Website   →  http://localhost:${PORT}/`);
  console.log(`  • Admin     →  http://localhost:${PORT}/admin/login.html`);
  console.log(`  • Data API  →  http://localhost:${PORT}/api/data\n`);
});
