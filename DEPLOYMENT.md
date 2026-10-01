# Multilingual CMS deployment

## Services required

- GitHub repository
- Render Web Service
- Supabase project for PostgreSQL and Storage

## Supabase

Apply `supabase/SETUP.sql`. It creates the publishing tables, neutral demo content, the public `media` storage bucket, and the database hardening used by this project.

The production web service does not receive a Supabase secret key or direct database password. Content reads/writes and image uploads are routed through protected Supabase Edge Functions. The functions use server-side Supabase credentials inside the Supabase environment.

## Render

Create a Node Web Service with:

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`
- Node: 22

Server environment variables:

```text
SESSION_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
SUPABASE_CMS_FUNCTION_URL=...
SUPABASE_CMS_TOKEN=...
SUPABASE_UPLOAD_FUNCTION_URL=...
SUPABASE_UPLOAD_TOKEN=...
```

`INDEXNOW_KEY` is optional.

## Production checks

Verify:

- `/api/health` returns `{"status":"ok"}`
- published demo posts load
- `/studio` accepts the configured administrator credentials
- drafts can be created, edited, translated, published, and deleted
- cover and inline images upload successfully
- RSS, sitemap, and public article routes remain reachable
