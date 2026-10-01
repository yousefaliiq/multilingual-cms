import { pgTable, serial, text, boolean, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Will be hashed
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  coverImage: text("cover_image"),
  published: boolean("published").default(false).notNull(),
  tags: text("tags").array(),
  coverImageSize: text("cover_image_size").default("aspect-video"),
  coverImageShape: text("cover_image_shape").default("rounded-2xl"),
  defaultLanguage: text("default_language").default("en").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Legacy fields (kept for migration/compatibility)
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"),
  readingTime: text("reading_time"),
});

export const postTranslations = pgTable("post_translations", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  language: text("language").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  readingTime: text("reading_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.postId, t.language),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPostSchema = createInsertSchema(posts, {
  slug: z.string().min(1, "Slug is required"),
}).extend({
  language: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertTranslationSchema = createInsertSchema(postTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type PostTranslation = typeof postTranslations.$inferSelect;
export type InsertPostTranslation = z.infer<typeof insertTranslationSchema>;

export type PostWithTranslations = Post & {
  translations: PostTranslation[];
  availableLanguages: string[];
};

export type PostListItem = Post & {
  availableLanguages: string[];
};
