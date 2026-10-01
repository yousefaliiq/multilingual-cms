# Multilingual CMS

Multilingual CMS is a full-stack multilingual publishing platform with a public editorial experience and a protected studio for writing, translating, and publishing content.

## Highlights

- Public article, archive, and tag views
- Protected editorial studio
- Draft and publication workflow
- Multiple language versions per article
- Rich article content with cover and inline image uploads
- PostgreSQL persistence and authenticated sessions
- Supabase Storage media uploads
- RSS feed, sitemap, canonical metadata, and structured data
- Responsive reading and editing experiences

## Stack

- React
- TypeScript
- Vite
- Express
- PostgreSQL
- Drizzle ORM
- Passport
- TanStack Query
- Supabase Storage
- Tailwind CSS

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Fresh portfolio deployment

1. Create a Supabase project.
2. Run `supabase/SETUP.sql` once in the Supabase SQL Editor.
3. Configure the environment variables from `.env.example`, including the initial administrator credentials.
4. Deploy the repository as a Render Web Service.
5. Sign in at `/studio` with the configured administrator credentials.

See `DEPLOYMENT.md` for the exact setup checklist.

## Repository safety

Keep `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, and `SUPABASE_SECRET_KEY` out of source control. The Supabase secret key is server-only and must never be exposed to browser code.
