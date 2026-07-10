/* ============================================================
   auth.js — authentication (who you are) + authorization
   ------------------------------------------------------------
   AUTHENTICATION: the admin proves identity by logging in with
   a username + password. The password is checked against a
   bcrypt hash; we never store the raw password.

   On success we issue a JWT (a signed token) and store it in an
   httpOnly cookie. httpOnly means JavaScript on the page can't
   read it, which protects it from XSS token theft.

   AUTHORIZATION: requireAdmin is middleware placed in front of
   every write route. It verifies the cookie's token and checks
   that role === 'admin'. No valid admin token → 401, request
   rejected before it ever touches the database.
============================================================ */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '8h';
const COOKIE_NAME = 'budget_token';

if (!JWT_SECRET || JWT_SECRET === 'change-me-to-a-long-random-string') {
  console.warn('\n⚠  JWT_SECRET is missing or still the default. Set a strong value in .env before going live.\n');
}

const cookieOptions = {
  httpOnly: true,                                   // JS can't read it (anti-XSS)
  sameSite: 'lax',                                  // sent on top-level navigations only (anti-CSRF)
  secure: process.env.SECURE_COOKIES === 'true',    // HTTPS-only in production
  maxAge: 8 * 60 * 60 * 1000,                        // 8 hours
  path: '/',
};

// look up an admin and verify the password
function verifyAdmin(username, password) {
  const row = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!row) return null;
  const ok = bcrypt.compareSync(password, row.password_hash);
  if (!ok) return null;
  return { id: row.id, username: row.username, role: row.role };
}

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// middleware: allow only authenticated admins through
function requireAdmin(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    req.admin = { id: payload.sub, username: payload.username, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expired — please log in again' });
  }
}

// helper to create/update an admin (used by create-admin.js)
function upsertAdmin(username, password, role = 'admin') {
  const hash = bcrypt.hashSync(password, 12);
  const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
  if (existing) {
    db.prepare('UPDATE admins SET password_hash = ?, role = ? WHERE id = ?').run(hash, role, existing.id);
    return { id: existing.id, username, role, updated: true };
  }
  const info = db.prepare('INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role);
  return { id: info.lastInsertRowid, username, role, updated: false };
}

module.exports = {
  COOKIE_NAME,
  cookieOptions,
  verifyAdmin,
  issueToken,
  requireAdmin,
  upsertAdmin,
};
