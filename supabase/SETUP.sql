BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  cover_image TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[],
  cover_image_size TEXT DEFAULT 'aspect-video',
  cover_image_shape TEXT DEFAULT 'rounded-2xl',
  default_language TEXT NOT NULL DEFAULT 'en',
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  title TEXT,
  subtitle TEXT,
  content TEXT,
  reading_time TEXT
);

CREATE TABLE IF NOT EXISTS public.post_translations (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  reading_time TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT post_translations_post_language_unique UNIQUE (post_id, language)
);

CREATE TABLE IF NOT EXISTS public.session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON public.session(expire);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  6291456,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO public.posts (
  slug, title, subtitle, content, published, reading_time, tags,
  default_language, published_at, created_at, updated_at,
  cover_image_size, cover_image_shape
)
VALUES
(
  'designing-for-clarity',
  'Designing for Clarity',
  'Small interface decisions that make complex products easier to understand.',
  E'Good interfaces reduce the amount of work a person has to do before they can act. Clear hierarchy, careful spacing, useful defaults, and predictable interactions often matter more than decoration.\n\n### Start with the task\n\nA strong interface makes the next action obvious without removing useful context. The goal is not to make every screen minimal; it is to make every element earn its place.',
  TRUE,
  '3 min read',
  ARRAY['design','product'],
  'en',
  NOW(), NOW(), NOW(),
  'aspect-video', 'rounded-2xl'
),
(
  'practical-publishing-workflow',
  'A Practical Publishing Workflow',
  'From draft to multilingual publication with a compact editorial system.',
  E'A publishing system is more useful when writing, translation, media, metadata, and publication status live in one workflow. Multilingual CMS demonstrates that flow with a lightweight editorial studio and a public reading experience.',
  TRUE,
  '2 min read',
  ARRAY['engineering','publishing'],
  'en',
  NOW(), NOW(), NOW(),
  'aspect-video', 'rounded-2xl'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.post_translations (post_id, language, title, subtitle, content, reading_time)
SELECT id, 'en', title, subtitle, content, reading_time
FROM public.posts
WHERE slug IN ('designing-for-clarity', 'practical-publishing-workflow')
ON CONFLICT (post_id, language) DO NOTHING;

COMMIT;
