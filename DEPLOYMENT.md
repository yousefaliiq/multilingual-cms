# Multilingual CMS deployment

## Services required

- GitHub repository
- Render Web Service
- Supabase project for PostgreSQL and Storage

## 1. Create the Supabase project

Create a new Supabase project dedicated to this portfolio copy.

Open **SQL Editor**, paste the entire contents of `supabase/SETUP.sql`, and run it once. This creates the application tables, session table, a public `media` storage bucket, and two neutral demo posts.

## 2. Collect Supabase values

You will need:

- `DATABASE_URL`: in the Supabase **Connect** dialog, use the **Session pooler** connection string and replace the password placeholder with the database password.
- `SUPABASE_URL`: the project URL.
- `SUPABASE_SECRET_KEY`: the server-only secret key (`sb_secret_...`). Never put this value in browser code or commit it to GitHub.

## 3. Create the Render Web Service

Connect this GitHub repository and use:

- Runtime: Node
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

Set these environment variables in Render:

```text
DATABASE_URL=...
SESSION_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
SUPABASE_STORAGE_BUCKET=media
```

Generate `SESSION_SECRET` as a long random value. Choose a private administrator username and password. The application creates that administrator at startup only when the users table is empty. `INDEXNOW_KEY` is optional and can be omitted for the portfolio deployment.

## 4. Verify

Check:

- `/api/health` returns `{ "status": "ok" }`
- the two demo posts load
- `/studio` accepts the configured administrator credentials
- a cover or inline image uploads successfully
- creating, editing, translating, publishing, and deleting posts works
