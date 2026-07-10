/* ============================================================
   db.js — SQLite database layer
   ------------------------------------------------------------
   - Creates the database file and all tables on first load.
   - Seeds the data tables from seed-data.js if they're empty.
   - Exposes safe helpers used by server.js.

   DATASETS below is the schema: for each dataset it lists the
   columns the API exposes, which of those are numeric (so CSV
   uploads get coerced to numbers), and the CREATE TABLE SQL.
   Table names always come from this whitelist, never from user
   input, so they're safe to use in SQL strings.
============================================================ */
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'budget.db'));
db.pragma('journal_mode = WAL');   // better read/write concurrency

const DATASETS = {
  ministries: {
    columns: ['name', 'nepali', 'amt', 'last', 'color'],
    numeric: ['amt', 'last'],
    ddl: `CREATE TABLE IF NOT EXISTS ministries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nepali TEXT,
      amt REAL NOT NULL DEFAULT 0,
      last REAL NOT NULL DEFAULT 0,
      color TEXT
    )`,
  },
  districts: {
    columns: ['name', 'nepali', 'pop', 'alloc', 'spent', 'work', 'hdi'],
    numeric: ['pop', 'alloc', 'spent', 'work', 'hdi'],
    ddl: `CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nepali TEXT,
      pop REAL,
      alloc REAL NOT NULL DEFAULT 0,
      spent REAL NOT NULL DEFAULT 0,
      work REAL NOT NULL DEFAULT 0,
      hdi REAL
    )`,
  },
  projects: {
    columns: ['name', 'dist', 'budget', 'spent', 'work', 'status'],
    numeric: ['budget', 'spent', 'work'],
    ddl: `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dist TEXT,
      budget REAL NOT NULL DEFAULT 0,
      spent REAL NOT NULL DEFAULT 0,
      work REAL NOT NULL DEFAULT 0,
      status TEXT
    )`,
  },
  revenues: {
    columns: ['name', 'nepali', 'amt', 'type'],
    numeric: ['amt'],
    ddl: `CREATE TABLE IF NOT EXISTS revenues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nepali TEXT,
      amt REAL NOT NULL DEFAULT 0,
      type TEXT
    )`,
  },
  indicators: {
    columns: ['name', 'val', 'nat', 'tgt'],
    numeric: ['val', 'nat', 'tgt'],
    ddl: `CREATE TABLE IF NOT EXISTS indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      val REAL,
      nat REAL,
      tgt REAL
    )`,
  },
  sdgs: {
    columns: ['goal', 'amt', 'color'],
    numeric: ['amt'],
    ddl: `CREATE TABLE IF NOT EXISTS sdgs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal TEXT NOT NULL,
      amt REAL NOT NULL DEFAULT 0,
      color TEXT
    )`,
  },
};

// ---- create the auth + audit tables ----
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS upload_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    dataset TEXT NOT NULL,
    rows INTEGER NOT NULL DEFAULT 0,
    filename TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---- create the data tables ----
for (const ds of Object.values(DATASETS)) db.exec(ds.ddl);

// ---- helpers ----
function isDataset(name) {
  return Object.prototype.hasOwnProperty.call(DATASETS, name);
}

function countRows(name) {
  if (!isDataset(name)) throw new Error('Unknown dataset: ' + name);
  return db.prepare(`SELECT COUNT(*) AS c FROM ${name}`).get().c;
}

function getAllData() {
  const out = {};
  for (const [name, ds] of Object.entries(DATASETS)) {
    out[name] = db.prepare(`SELECT ${ds.columns.join(', ')} FROM ${name} ORDER BY id`).all();
  }
  return out;
}

// Replace ALL rows of a dataset in one transaction (all-or-nothing).
function replaceDataset(name, rows) {
  if (!isDataset(name)) throw new Error('Unknown dataset: ' + name);
  const cols = DATASETS[name].columns;
  const insert = db.prepare(
    `INSERT INTO ${name} (${cols.join(', ')}) VALUES (${cols.map(c => '@' + c).join(', ')})`
  );
  const clear = db.prepare(`DELETE FROM ${name}`);
  const tx = db.transaction((items) => {
    clear.run();
    for (const item of items) {
      const clean = {};
      for (const c of cols) clean[c] = item[c] === undefined ? null : item[c];
      insert.run(clean);
    }
  });
  tx(rows);
  return rows.length;
}

function logUpload(adminId, dataset, rows, filename) {
  db.prepare(
    `INSERT INTO upload_log (admin_id, dataset, rows, filename) VALUES (?, ?, ?, ?)`
  ).run(adminId, dataset, rows, filename || null);
}

function recentUploads(limit = 10) {
  return db.prepare(
    `SELECT u.dataset, u.rows, u.filename, u.created_at, a.username
     FROM upload_log u LEFT JOIN admins a ON a.id = u.admin_id
     ORDER BY u.id DESC LIMIT ?`
  ).all(limit);
}

// ---- seed empty tables on first run ----
function seedIfEmpty() {
  const seed = require('./seed-data');
  for (const name of Object.keys(DATASETS)) {
    if (countRows(name) === 0 && Array.isArray(seed[name])) {
      replaceDataset(name, seed[name]);
      console.log(`Seeded ${seed[name].length} rows into "${name}"`);
    }
  }
}
seedIfEmpty();

module.exports = {
  db,
  DATASETS,
  isDataset,
  countRows,
  getAllData,
  replaceDataset,
  logUpload,
  recentUploads,
};
