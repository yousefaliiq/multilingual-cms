import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? undefined
    : { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

export async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
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

    CREATE TABLE IF NOT EXISTS post_translations (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      language TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content TEXT NOT NULL,
      reading_time TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT post_translations_post_language_unique UNIQUE (post_id, language)
    );

    CREATE TABLE IF NOT EXISTS session (
      sid VARCHAR NOT NULL PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
  `);

  const { rows } = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM posts");
  if (rows[0]?.count === "0") {
    await pool.query(`
      INSERT INTO posts (
        slug, title, subtitle, content, published, reading_time, tags,
        default_language, published_at, created_at, updated_at,
        cover_image_size, cover_image_shape
      )
      VALUES
      (
        'designing-for-clarity',
        'Designing for Clarity',
        'Small interface decisions that make complex products easier to understand.',
        E'Good interfaces reduce the amount of work a person has to do before they can act. Clear hierarchy, careful spacing, useful defaults, and predictable interactions often matter more than decoration.\\n\\n### Start with the task\\n\\nA strong interface makes the next action obvious without removing useful context. The goal is not to make every screen minimal; it is to make every element earn its place.',
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

      INSERT INTO post_translations (post_id, language, title, subtitle, content, reading_time)
      SELECT id, 'en', title, subtitle, content, reading_time
      FROM posts
      WHERE slug IN ('designing-for-clarity', 'practical-publishing-workflow')
      ON CONFLICT (post_id, language) DO NOTHING;
    `);
  }
}
