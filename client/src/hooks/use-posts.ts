import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type PostResponse } from "@shared/routes";
import type { InsertPost } from "@shared/schema";

declare global {
  interface Window {
    __ATLAS_BOOTSTRAP__?: {
      route?: "home" | "archive" | "tag" | "post" | "other";
      post?: PostResponse | null;
      posts?: PostResponse[];
      tag?: string;
    };
  }
}

function getBootstrapState() {
  if (typeof window === "undefined") return undefined;
  return window.__ATLAS_BOOTSTRAP__;
}

export function getActiveTranslation(post: PostResponse | null, lang: string) {
  if (!post) return null;

  const normalizedLang = lang.trim().toLowerCase();

  if (post.translations && post.translations.length > 0) {
    const translation = post.translations.find(
      (t) => t.language.trim().toLowerCase() === normalizedLang,
    );
    if (translation) return translation;

    const defaultTranslation = post.translations.find(
      (t) =>
        t.language.trim().toLowerCase() ===
        (post.defaultLanguage || "").trim().toLowerCase(),
    );
    if (defaultTranslation) return defaultTranslation;

    return post.translations[0];
  }

  return {
    language: post.defaultLanguage || "English",
    title: post.title,
    subtitle: post.subtitle,
    content: post.content,
    readingTime: post.readingTime,
  };
}

interface UsePostsOptions {
  published?: string;
  tag?: string;
}

function getInitialPosts(options?: UsePostsOptions) {
  const bootstrap = getBootstrapState();
  if (!bootstrap?.posts?.length) return undefined;

  const isPublishedList = options?.published === "true";
  if (!isPublishedList) return undefined;

  if (options?.tag) {
    if (bootstrap.route === "tag" && bootstrap.tag === options.tag) {
      return bootstrap.posts;
    }
    return undefined;
  }

  if (bootstrap.route === "home" || bootstrap.route === "archive") {
    return bootstrap.posts;
  }

  return undefined;
}

export function usePosts(options?: UsePostsOptions) {
  const params = new URLSearchParams();
  if (options?.published) params.append("published", options.published);
  if (options?.tag) params.append("tag", options.tag);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const url = `${api.posts.list.path}${queryString}`;

  return useQuery({
    queryKey: [api.posts.list.path, options],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.posts.list.responses[200].parse(await res.json());
    },
    initialData: getInitialPosts(options),
  });
}

function getInitialPost(slug: string) {
  const bootstrap = getBootstrapState();
  if (bootstrap?.route === "post" && bootstrap.post?.slug === slug) {
    return bootstrap.post;
  }
  return undefined;
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: [api.posts.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.posts.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      return api.posts.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
    initialData: getInitialPost(slug),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPost) => {
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create post");
      }
      return api.posts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertPost> }) => {
      const url = buildUrl(api.posts.update.path, { id });
      const res = await fetch(url, {
        method: api.posts.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update post");
      return api.posts.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.posts.get.path] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.posts.delete.path, { id });
      const res = await fetch(url, {
        method: api.posts.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}
