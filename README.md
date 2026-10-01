# Multilingual CMS

Multilingual CMS is a full-stack multilingual publishing platform with a public reading experience and a protected editorial studio for writing, translating, and publishing content.

## Highlights

- Public article, archive, and tag views
- Protected editorial studio
- Draft and publication workflow
- Multiple language versions per article
- Cover and inline image uploads
- PostgreSQL persistence through a protected Supabase backend
- Signed administrator sessions
- Supabase Storage media uploads
- RSS feed, sitemap, canonical metadata, and structured data
- Responsive reading and editing experiences

## Stack

- React
- TypeScript
- Vite
- Express
- PostgreSQL / Supabase
- Passport
- TanStack Query
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

## Backend design

The public database tables use Row Level Security and are not exposed directly to anonymous browser clients. The Express server talks to protected Supabase Edge Functions for content operations and media uploads. Supabase server credentials remain inside Supabase rather than the Render environment.

Administrator access uses a single deployment credential pair stored only in the server environment and a signed, HTTP-only session cookie.

## Fresh deployment

1. Create a Supabase project and apply `supabase/SETUP.sql`.
2. Deploy the protected content and media Edge Functions.
3. Configure the variables from `.env.example`.
4. Deploy this repository as a Render Web Service.
5. Verify the health endpoint, public posts, studio login, editing, translation, publication, and image upload.

See `DEPLOYMENT.md` for the production checklist.

## Repository safety

Keep session secrets, administrator credentials, and protected backend tokens out of source control. No Supabase secret key is required in the web-service environment.
