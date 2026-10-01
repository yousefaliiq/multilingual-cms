import { z } from 'zod';
import { insertPostSchema, posts } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const postTranslationSchema = z.object({
  language: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  content: z.string(),
  readingTime: z.string().nullable().optional(),
});

export const postWithTranslationsSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  content: z.string(),
  coverImage: z.string().nullable().optional(),
  coverImageSize: z.string().nullable().optional(),
  coverImageShape: z.string().nullable().optional(),
  readingTime: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  published: z.boolean(),
  publishedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  defaultLanguage: z.string().optional(),
  availableLanguages: z.array(z.string()).optional(),
  translations: z.array(postTranslationSchema).optional(),
});

export type PostWithTranslations = z.infer<typeof postWithTranslationsSchema>;

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ success: z.boolean().optional(), id: z.number(), username: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: { 200: z.object({ message: z.string() }) },
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: {
        200: z.object({ id: z.number(), username: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts' as const,
      input: z.object({
        tag: z.string().optional(),
        published: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(postWithTranslationsSchema),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/posts/:slug' as const,
      responses: {
        200: postWithTranslationsSchema,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts' as const,
      input: insertPostSchema.extend({
        language: z.string().optional(),
      }),
      responses: {
        201: postWithTranslationsSchema,
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/posts/:id' as const,
      input: insertPostSchema.partial().extend({
        language: z.string().optional(),
      }),
      responses: {
        200: postWithTranslationsSchema,
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/posts/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type PostResponse = z.infer<typeof api.posts.create.responses[201]>;
export type PostsListResponse = z.infer<typeof api.posts.list.responses[200]>;
