/* ============================================================
   create-admin.js — run once to create the first admin.
   Usage:  npm run create-admin
   Reads ADMIN_USERNAME / ADMIN_PASSWORD from .env, hashes the
   password, and inserts (or updates) the admin in the database.
   Running it again with the same username resets that password.
============================================================ */
require('dotenv').config();
const { upsertAdmin } = require('./auth');

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file first.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Choose an admin password of at least 8 characters.');
  process.exit(1);
}

const result = upsertAdmin(username, password, 'admin');
console.log(
  result.updated
    ? `Admin "${username}" already existed — password has been reset.`
    : `Admin "${username}" created.`
);
console.log('You can now log in at /admin/login.html');
process.exit(0);
