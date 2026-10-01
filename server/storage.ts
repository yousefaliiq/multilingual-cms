import { db } from "./db";
import {
  users,
  posts,
  postTranslations,
  type User,
  type InsertUser,
  type Post,
  type PostTranslation,
  type InsertPost,
  type PostWithTranslations,
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPosts(options?: { published?: boolean; tag?: string }): Promise<any[]>;
  getPostBySlug(slug: string): Promise<any | undefined>;
  getPost(id: number): Promise<any | undefined>;
  createPost(post: InsertPost): Promise<any>;
  updatePost(id: number, updates: Partial<InsertPost>): Promise<any>;
  deletePost(id: number): Promise<void>;
  
  getTranslations(postId: number): Promise<PostTranslation[]>;
  upsertTranslation(postId: number, language: string, data: Partial<PostTranslation>): Promise<PostTranslation>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  private async ensureTranslation(post: Post) {
    const translations = await this.getTranslations(post.id);
    const hasDefault = translations.some(t => t.language === post.defaultLanguage);
    
    if (!hasDefault && post.title && post.content) {
      await this.upsertTranslation(post.id, post.defaultLanguage, {
        title: post.title,
        subtitle: post.subtitle,
        content: post.content,
        readingTime: post.readingTime
      });
      return this.getTranslations(post.id);
    }
    return translations;
  }

  async getPosts(options?: { published?: boolean; tag?: string }): Promise<any[]> {
    let query = db.select().from(posts).orderBy(desc(posts.publishedAt), desc(posts.createdAt));
    let result = await query;
    
    if (options?.published !== undefined) {
      result = result.filter(p => p.published === options.published);
    }
    if (options?.tag) {
      result = result.filter(p => p.tags && p.tags.includes(options.tag!));
    }

    return Promise.all(result.map(async (post) => {
      const translations = await db.select().from(postTranslations).where(eq(postTranslations.postId, post.id));
      const availableLanguages = Array.from(new Set([post.defaultLanguage, ...translations.map(t => t.language)]));
      return {
        ...post,
        availableLanguages
      };
    }));
  }

  async getPostBySlug(slug: string): Promise<any | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
    if (!post) return undefined;
    
    const translations = await this.ensureTranslation(post);
    const availableLanguages = Array.from(new Set([post.defaultLanguage, ...translations.map(t => t.language)]));
    return {
      ...post,
      translations,
      availableLanguages
    };
  }

  async getPost(id: number): Promise<any | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) return undefined;

    const translations = await this.ensureTranslation(post);
    const availableLanguages = Array.from(new Set([post.defaultLanguage, ...translations.map(t => t.language)]));
    return {
      ...post,
      translations,
      availableLanguages
    };
  }

  async createPost(insertPost: InsertPost): Promise<any> {
    const { language = 'en', ...postData } = insertPost;
    const [post] = await db.insert(posts).values({
      ...postData,
      defaultLanguage: language,
      coverImageSize: postData.coverImageSize || 'aspect-video',
      coverImageShape: postData.coverImageShape || 'rounded-2xl',
      publishedAt: postData.published ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    if (postData.title && postData.content) {
      await this.upsertTranslation(post.id, language, {
        title: postData.title,
        subtitle: postData.subtitle,
        content: postData.content,
        readingTime: postData.readingTime
      });
    }

    return this.getPost(post.id);
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<any> {
    const currentPost = await db.select().from(posts).where(eq(posts.id, id)).then(res => res[0]);
    if (!currentPost) throw new Error("Post not found");

    const { language, ...postUpdates } = updates;
    const isDefaultLang = !language || language === currentPost.defaultLanguage;

    let publishedAt = currentPost.publishedAt;
    if (updates.published && !currentPost.published) {
      publishedAt = new Date();
    }

    const setValues: any = { 
      ...postUpdates, 
      publishedAt, 
      updatedAt: new Date() 
    };

    if (!isDefaultLang) {
      delete setValues.title;
      delete setValues.subtitle;
      delete setValues.content;
      delete setValues.readingTime;
    }

    const [post] = await db
      .update(posts)
      .set(setValues)
      .where(eq(posts.id, id))
      .returning();

    if (language && (updates.title || updates.content)) {
      await this.upsertTranslation(post.id, language, {
        title: updates.title || currentPost.title || "",
        subtitle: updates.subtitle || currentPost.subtitle,
        content: updates.content || currentPost.content || "",
        readingTime: updates.readingTime || currentPost.readingTime
      });
    } else if (isDefaultLang && (updates.title || updates.content)) {
      await this.upsertTranslation(post.id, currentPost.defaultLanguage, {
        title: updates.title || currentPost.title || "",
        subtitle: updates.subtitle || currentPost.subtitle,
        content: updates.content || currentPost.content || "",
        readingTime: updates.readingTime || currentPost.readingTime
      });
    }

    return this.getPost(post.id);
  }

  async deletePost(id: number): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getTranslations(postId: number): Promise<PostTranslation[]> {
    return db.select().from(postTranslations).where(eq(postTranslations.postId, postId));
  }

  async upsertTranslation(postId: number, language: string, data: Partial<PostTranslation>): Promise<PostTranslation> {
    const [existing] = await db.select().from(postTranslations).where(
      and(eq(postTranslations.postId, postId), eq(postTranslations.language, language))
    );

    if (existing) {
      const [updated] = await db.update(postTranslations).set({
        ...data,
        updatedAt: new Date()
      }).where(eq(postTranslations.id, existing.id)).returning();
      return updated;
    } else {
      const [inserted] = await db.insert(postTranslations).values({
        postId,
        language,
        title: data.title!,
        subtitle: data.subtitle,
        content: data.content!,
        readingTime: data.readingTime,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return inserted;
    }
  }
}

export const storage = new DatabaseStorage();
