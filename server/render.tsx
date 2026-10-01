import type { Request } from "express";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { storage } from "./storage";

type AnyPost = Awaited<ReturnType<typeof storage.getPostBySlug>>;

export interface BootstrapState {
  route: "home" | "archive" | "tag" | "post" | "other";
  post?: AnyPost | null;
  posts?: any[];
  tag?: string;
}

function getQueryLanguage(req: Request, post?: AnyPost | null): string {
  const queryLang = typeof req.query.lang === "string" ? req.query.lang.trim() : "";
  if (!post) return queryLang || "";

  const available = [
    post.defaultLanguage || "",
    ...(post.translations?.map((translation) => translation.language || "") || []),
  ].filter(Boolean);

  if (!queryLang) {
    return available[0] || "";
  }

  const match = available.find((language) => language.toLowerCase() == queryLang.toLowerCase());
  return match || available[0] || queryLang;
}

function getActiveTranslation(post?: AnyPost | null, language?: string) {
  if (!post) return null;

  const normalizedLang = language?.trim().toLowerCase() || "";

  if (post.translations?.length) {
    const direct = post.translations.find(
      (translation) => translation.language?.trim().toLowerCase() === normalizedLang,
    );
    if (direct) return direct;

    const fallback = post.translations.find(
      (translation) =>
        translation.language?.trim().toLowerCase() ===
        (post.defaultLanguage || "").trim().toLowerCase(),
    );
    if (fallback) return fallback;

    return post.translations[0];
  }

  return {
    language: post.defaultLanguage || "en",
    title: post.title || "",
    subtitle: post.subtitle || "",
    content: post.content || "",
    readingTime: post.readingTime || "",
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeRichHtml(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "")
    .replace(/\son[a-z]+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<a\b(?![^>]*\btarget=)([^>]*)>/gi, '<a target="_blank" rel="noopener noreferrer"$1>');
}

function isRichHtmlContent(value?: string | null): boolean {
  if (!value) return false;
  return /<\s*(p|div|br|strong|b|em|i|a|figure|img|ul|ol|li|blockquote|h[1-6]|span)\b/i.test(value);
}

function renderContentHtml(content?: string | null): string {
  if (!content) {
    return "";
  }

  if (isRichHtmlContent(content)) {
    return sanitizeRichHtml(content);
  }

  return renderToStaticMarkup(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(ReactMarkdown as any, { remarkPlugins: [remarkGfm] }, content),
    ),
  );
}

function stripContentToText(content?: string | null): string {
  if (!content) return "";

  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[>#*_~\-]{1,3}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildDescription(post?: AnyPost | null, language?: string): string {
  if (!post) return "";
  const translation = getActiveTranslation(post, language);
  const fallback = stripContentToText(translation?.content || post.content || "");
  const description = translation?.subtitle?.trim() || post.subtitle?.trim() || fallback;
  if (!description) return "";
  return description.length > 160 ? `${description.slice(0, 157).trim()}...` : description;
}

function formatDate(dateValue?: unknown): string {
  const value = dateValue ? new Date(String(dateValue)) : null;
  if (!value || Number.isNaN(value.getTime())) return "";
  return format(value, "MMMM d, yyyy");
}

function inferLangDirection(value: string): "rtl" | "ltr" {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value) ? "rtl" : "ltr";
}

function toAbsoluteUrl(baseUrl: string, url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function safeJson(value: unknown): string {
  return JSON.stringify(value ?? {})
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export async function buildBootstrapState(req: Request): Promise<BootstrapState> {
  let bootstrap: BootstrapState = { route: "other" };

  if (req.path === "/" || req.path === "/archive") {
    const posts = await storage.getPosts({ published: true });
    bootstrap = {
      route: req.path === "/" ? "home" : "archive",
      posts,
    };
  } else if (req.path.startsWith("/tags/")) {
    const tag = decodeURIComponent(req.path.replace(/^\/tags\//, ""));
    const posts = await storage.getPosts({ published: true, tag });
    bootstrap = {
      route: "tag",
      posts,
      tag,
    };
  } else {
    const postMatch = req.path.match(/^\/post\/([^/]+)/);
    if (postMatch) {
      const slug = decodeURIComponent(postMatch[1]);
      const post = await storage.getPostBySlug(slug);
      bootstrap = {
        route: "post",
        post: post?.published ? post : null,
      };
    }
  }

  return bootstrap;
}

function renderPostSnapshot(baseUrl: string, post: NonNullable<AnyPost>, language: string): string {
  const translation = getActiveTranslation(post, language);
  if (!translation) return "";

  const title = translation.title || post.title || "Untitled post";
  const subtitle = translation.subtitle || post.subtitle || "";
  const contentHtml = renderContentHtml(translation.content || post.content || "");
  const imageUrl = toAbsoluteUrl(baseUrl, post.coverImage) || toAbsoluteUrl(baseUrl, "/og-image-v2.png");
  const dir = inferLangDirection(`${title} ${translation.content || ""}`);
  const dateText = formatDate(post.publishedAt || post.createdAt);
  const timeValue = post.publishedAt || post.createdAt;
  const tagLinks = (post.tags || [])
    .map(
      (tag: string) => `<li><a href="/tags/${encodeURIComponent(tag)}">${escapeHtml(tag)}</a></li>`,
    )
    .join("");

  return `
    <main aria-label="Article">
      <article>
        <header>
          <p>${escapeHtml(dateText)}${translation.readingTime ? ` • ${escapeHtml(translation.readingTime)}` : ""}</p>
          <h1 dir="${dir}">${escapeHtml(title)}</h1>
          ${subtitle ? `<p dir="${dir}">${escapeHtml(subtitle)}</p>` : ""}
          ${tagLinks ? `<ul>${tagLinks}</ul>` : ""}
        </header>
        ${imageUrl ? `<figure><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" /></figure>` : ""}
        <div dir="${dir}" data-prerendered-post-body="true">${contentHtml}</div>
        ${timeValue ? `<footer><p><time datetime="${escapeHtml(new Date(String(timeValue)).toISOString())}">${escapeHtml(dateText)}</time></p></footer>` : ""}
      </article>
    </main>
  `;
}

function renderPostListSnapshot(title: string, description: string, posts: any[]): string {
  const items = posts
    .map((post) => {
      const subtitle = post.subtitle || buildDescription(post, post.defaultLanguage) || "";
      const dateText = formatDate(post.publishedAt || post.createdAt);
      return `
        <li>
          <article>
            <h2><a href="/post/${encodeURIComponent(post.slug)}">${escapeHtml(post.title || "Untitled post")}</a></h2>
            ${dateText ? `<p><time datetime="${escapeHtml(new Date(String(post.publishedAt || post.createdAt)).toISOString())}">${escapeHtml(dateText)}</time></p>` : ""}
            ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
          </article>
        </li>
      `;
    })
    .join("");

  return `
    <main aria-label="Blog content">
      <section>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
      </section>
      <section>
        <ul>
          ${items}
        </ul>
      </section>
    </main>
  `;
}

export function renderPrerenderedHtml(req: Request, bootstrap: BootstrapState, baseUrl: string): string {
  if (bootstrap.route === "post" && bootstrap.post) {
    const language = getQueryLanguage(req, bootstrap.post);
    return renderPostSnapshot(baseUrl, bootstrap.post, language);
  }

  if (bootstrap.route === "home") {
    return renderPostListSnapshot(
      "Multilingual CMS — Independent publishing, thoughtfully built",
      "A multilingual publishing platform for focused long-form writing and editorial workflows.",
      bootstrap.posts || [],
    );
  }

  if (bootstrap.route === "archive") {
    return renderPostListSnapshot(
      "Archive — Multilingual CMS",
      "Browse all published articles from Multilingual CMS.",
      bootstrap.posts || [],
    );
  }

  if (bootstrap.route === "tag") {
    return renderPostListSnapshot(
      `${bootstrap.tag || "Tag"} — Multilingual CMS`,
      `Published articles tagged with ${bootstrap.tag || "this topic"}.`,
      bootstrap.posts || [],
    );
  }

  return "";
}

export function getBootstrapJson(bootstrap: BootstrapState): string {
  return safeJson(bootstrap);
}

export function getPostSeoContext(req: Request, bootstrap?: BootstrapState) {
  const activeBootstrap = bootstrap?.route === "post" ? bootstrap : null;
  if (!activeBootstrap?.post) return null;

  const language = getQueryLanguage(req, activeBootstrap.post);
  const translation = getActiveTranslation(activeBootstrap.post, language);
  if (!translation) return null;

  return {
    post: activeBootstrap.post,
    translation,
    language,
    description: buildDescription(activeBootstrap.post, language),
  };
}
