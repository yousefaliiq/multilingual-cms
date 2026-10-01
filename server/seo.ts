import { type Request } from "express";
import { storage } from "./storage";
import { buildBootstrapState, getPostSeoContext } from "./render";

export interface SeoMeta {
  siteName: string;
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage: string;
  robots: string;
  structuredData: string;
  publishedTime?: string;
  modifiedTime?: string;
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character] || character));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function toAbsoluteUrl(baseUrl: string, url?: string | null): string {
  if (!url) return `${baseUrl}/og-image-v2.png`;
  return /^https?:\/\//i.test(url)
    ? url
    : `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function stripText(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[>#*_~\-]{1,3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeDescription(value: string): string {
  const clean = stripText(value);
  if (!clean) return "";
  return clean.length > 160 ? `${clean.slice(0, 157).trim()}...` : clean;
}

export async function buildSeoMeta(req: Request): Promise<SeoMeta> {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const canonical = `${baseUrl}${req.originalUrl.split("?")[0]}`;

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Multilingual CMS",
    alternateName: "Multilingual CMS",
    url: `${baseUrl}/`,
    inLanguage: "en",
  };

  const defaultMeta: SeoMeta = {
    siteName: "Multilingual CMS",
    title: "Multilingual CMS - Independent publishing, thoughtfully built",
    description:
      "A multilingual publishing platform for focused long-form writing and editorial workflows.",
    ogImage: `${baseUrl}/og-image-v2.png`,
    ogType: "website",
    robots: "index, follow",
    canonical,
    structuredData: `<script type="application/ld+json">${safeJson(websiteSchema)}</script>`,
  };

  if (req.path.startsWith("/studio")) {
    return {
      ...defaultMeta,
      robots: "noindex, nofollow",
    };
  }

  if (req.path === "/archive") {
    return {
      ...defaultMeta,
      title: "Archive - Multilingual CMS",
      description: "Browse all published articles from Multilingual CMS.",
    };
  }

  if (req.path.startsWith("/tags/")) {
    const tag = decodeURIComponent(req.path.replace(/^\/tags\//, ""));
    return {
      ...defaultMeta,
      title: `${tag} - Multilingual CMS`,
      description: `Published articles tagged with ${tag} on Multilingual CMS.`,
    };
  }

  const postMatch = req.path.match(/^\/post\/([^\/]+)/);
  if (postMatch) {
    try {
      const bootstrap = await buildBootstrapState(req);
      const context = getPostSeoContext(req, bootstrap);
      if (context) {
        const { post, translation, description } = context;
        const imageUrl = toAbsoluteUrl(baseUrl, post.coverImage || undefined);
        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: translation.title || post.title || "Untitled post",
          description: description || defaultMeta.description,
          image: imageUrl,
          mainEntityOfPage: canonical,
          url: canonical,
          datePublished: post.publishedAt ? new Date(String(post.publishedAt)).toISOString() : undefined,
          dateModified: new Date(String(post.updatedAt || post.publishedAt || post.createdAt)).toISOString(),
          author: {
            "@type": "Person",
            name: "Atlas Editorial",
          },
          publisher: {
            "@type": "Organization",
            name: "Multilingual CMS",
            logo: {
              "@type": "ImageObject",
              url: `${baseUrl}/favicon-96x96.png`,
            },
          },
          inLanguage: translation.language || post.defaultLanguage || "en",
        };

        return {
          ...defaultMeta,
          title: `${translation.title || post.title} - Multilingual CMS`,
          description: description || defaultMeta.description,
          ogType: "article",
          ogImage: imageUrl,
          structuredData: [websiteSchema, articleSchema]
            .map((schema) => `<script type="application/ld+json">${safeJson(schema)}</script>`)
            .join("\n"),
          publishedTime: post.publishedAt ? new Date(String(post.publishedAt)).toISOString() : undefined,
          modifiedTime: new Date(String(post.updatedAt || post.publishedAt || post.createdAt)).toISOString(),
        };
      }

      const post = await storage.getPostBySlug(postMatch[1]);
      if (post?.published) {
        return {
          ...defaultMeta,
          title: `${post.title} - Multilingual CMS`,
          description: makeDescription(post.subtitle || post.content || "") || defaultMeta.description,
          ogType: "article",
          ogImage: toAbsoluteUrl(baseUrl, post.coverImage || undefined),
        };
      }
    } catch (error) {
      console.error("SEO: Failed to build post metadata", error);
    }
  }

  return defaultMeta;
}

export function injectSeo(
  html: string,
  meta: SeoMeta,
  options?: {
    structuredData?: string;
    prerenderedApp?: string;
    bootstrapJson?: string;
  },
): string {
  const articleMeta = [
    meta.publishedTime
      ? `<meta property="article:published_time" content="${escape(meta.publishedTime)}">`
      : "",
    meta.modifiedTime
      ? `<meta property="article:modified_time" content="${escape(meta.modifiedTime)}">`
      : "",
  ].join("\n");

  return html
    .replace(/__SEO_SITE_NAME__/g, escape(meta.siteName))
    .replace(/__SEO_TITLE__/g, escape(meta.title))
    .replace(/__SEO_DESCRIPTION__/g, escape(meta.description))
    .replace(/__SEO_CANONICAL__/g, escape(meta.canonical))
    .replace(/__SEO_OG_TYPE__/g, escape(meta.ogType))
    .replace(/__SEO_OG_IMAGE__/g, escape(meta.ogImage))
    .replace(/__SEO_ROBOTS__/g, escape(meta.robots))
    .replace(/__SEO_STRUCTURED_DATA__/g, options?.structuredData || meta.structuredData || "")
    .replace(/__SEO_ARTICLE_META__/g, articleMeta)
    .replace(/__PRERENDERED_APP__/g, options?.prerenderedApp || "")
    .replace(/__BOOTSTRAP_JSON__/g, options?.bootstrapJson || "{}");
}
