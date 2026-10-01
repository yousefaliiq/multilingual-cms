import type {
  PostTranslation,
  InsertPost,
} from "@shared/schema";

function endpoint(action: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const base = process.env.SUPABASE_CMS_FUNCTION_URL;
  if (!base) throw new Error("SUPABASE_CMS_FUNCTION_URL is not configured");
  const url = new URL(base);
  url.searchParams.set("action", action);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url;
}

async function cmsFetch<T>(
  action: string,
  options: RequestInit = {},
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const token = process.env.SUPABASE_CMS_TOKEN;
  if (!token) throw new Error("SUPABASE_CMS_TOKEN is not configured");

  const response = await fetch(endpoint(action, params), {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-cms-token": token,
      ...(options.headers || {}),
    },
  });

  if (response.status === 404) return undefined as T;
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body?.message === "string" ? body.message : `CMS request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export interface IStorage {
  getPosts(options?: { published?: boolean; tag?: string }): Promise<any[]>;
  getPostBySlug(slug: string): Promise<any | undefined>;
  getPost(id: number): Promise<any | undefined>;
  createPost(post: InsertPost): Promise<any>;
  updatePost(id: number, updates: Partial<InsertPost>): Promise<any>;
  deletePost(id: number): Promise<void>;
  getTranslations(postId: number): Promise<PostTranslation[]>;
  upsertTranslation(postId: number, language: string, data: Partial<PostTranslation>): Promise<PostTranslation>;
}

export class RemoteStorage implements IStorage {
  getPosts(options?: { published?: boolean; tag?: string }) {
    return cmsFetch<any[]>("list", {}, options);
  }

  getPostBySlug(slug: string) {
    return cmsFetch<any | undefined>("getBySlug", {}, { slug });
  }

  getPost(id: number) {
    return cmsFetch<any | undefined>("get", {}, { id });
  }

  createPost(post: InsertPost) {
    return cmsFetch<any>("create", {
      method: "POST",
      body: JSON.stringify(post),
    });
  }

  updatePost(id: number, updates: Partial<InsertPost>) {
    return cmsFetch<any>("update", {
      method: "PUT",
      body: JSON.stringify(updates),
    }, { id });
  }

  async deletePost(id: number): Promise<void> {
    await cmsFetch<void>("delete", { method: "DELETE" }, { id });
  }

  async getTranslations(postId: number): Promise<PostTranslation[]> {
    const post = await this.getPost(postId);
    return post?.translations ?? [];
  }

  async upsertTranslation(): Promise<PostTranslation> {
    throw new Error("Translations are managed through post updates");
  }
}

export const storage = new RemoteStorage();
