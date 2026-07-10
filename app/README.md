# Sudurpaschim Province Budget Visualizer — full-stack app

A provincial budget dashboard (public website) backed by a small Node/Express
API, a SQLite database, and an admin area where data is uploaded via CSV.

## Structure

```
app/
├─ server/                  the backend (you run this)
│  ├─ server.js             Express app: serves the site + the API
│  ├─ db.js                 SQLite schema, seeding, query helpers
│  ├─ auth.js               login, JWT cookie, requireAdmin guard
│  ├─ seed-data.js          data used to fill empty tables on first run
│  ├─ create-admin.js       one-time script to create the admin
│  ├─ package.json          dependencies + scripts
│  ├─ .env.example          copy to .env and fill in
│  └─ budget.db             created automatically on first run (git-ignored)
└─ public/                  the website (served by the server)
   ├─ index.html … report.html, styles.css, data.js, app.js
   └─ admin/
      ├─ login.html         admin sign-in
      ├─ dashboard.html     upload data, see history
      └─ samples/*.csv      one sample per dataset (correct headers)
```

## Setup (first time)

```bash
cd server
cp .env.example .env
# 1) put a strong random secret in .env:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
#    paste it as JWT_SECRET, and set ADMIN_USERNAME / ADMIN_PASSWORD
npm install
npm run create-admin      # creates the admin from .env
npm start
```

Then open:
- Website  → http://localhost:3000/
- Admin    → http://localhost:3000/admin/login.html

The database is seeded with starter data on first run, so the site works
immediately. Log in as admin to replace any dataset by uploading a CSV
(download a sample on each card to see the exact columns).

## API

| Method | Route                         | Access | Purpose                         |
|--------|-------------------------------|--------|---------------------------------|
| GET    | `/api/data`                   | public | all datasets for the site       |
| GET    | `/api/datasets`               | public | schema + current row counts     |
| POST   | `/api/auth/login`             | public | log in (rate limited)           |
| POST   | `/api/auth/logout`            | public | log out                         |
| GET    | `/api/auth/me`                | admin  | current admin                   |
| POST   | `/api/admin/upload/:dataset`  | admin  | replace a dataset from CSV      |
| GET    | `/api/admin/uploads`          | admin  | recent upload history           |

Datasets: `ministries`, `districts`, `projects`, `revenues`, `indicators`, `sdgs`.

## Before deploying to the public internet

- Set a long, random `JWT_SECRET` (never commit `.env`).
- Serve over HTTPS and set `SECURE_COOKIES=true` in `.env`.
- Use a strong admin password.
- Tighten the Content-Security-Policy in `server.js` (CSP is disabled by default
  so inline styles work out of the box).
- The database is the file `server/budget.db` — back it up.
