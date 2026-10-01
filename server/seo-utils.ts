import type { Request } from "express";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeHtml(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "")
    .replace(/\son[a-z]+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export function isRichHtmlContent(value?: string | null): boolean {
  if (!value) return false;
  return /<\s*(p|div|br|strong|b|em|i|a|figure|img|ul|ol|li|blockquote|h[1-6]|span)\b/i.test(value);
}

function escapeMarkdownInline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || "")}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => `<a href="${escapeHtml(href)}">${text}</a>`);
}

export function renderContentToHtml(value?: string | null): string {
  if (!value) return "";

  if (isRichHtmlContent(value)) {
    return sanitizeHtml(value);
  }

  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const blocks = normalized.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const parts: string[] = [];

  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) {
      parts.push(`<ul>${listBuffer.join("")}</ul>`);
      listBuffer = [];
    }
  };

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      for (const line of lines) {
        listBuffer.push(`<li>${escapeMarkdownInline(line.replace(/^[-*]\s+/, ""))}</li>`);
      }
      flushList();
      continue;
    }

    flushList();

    if (lines.length === 1 && /^#{1,6}\s+/.test(lines[0])) {
      const match = lines[0].match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = Math.min(match[1].length, 6);
        parts.push(`<h${level}>${escapeMarkdownInline(match[2])}</h${level}>`);
        continue;
      }
    }

    if (lines.every((line) => /^>\s?/.test(line))) {
      const quote = lines.map((line) => escapeMarkdownInline(line.replace(/^>\s?/, ""))).join("<br>");
      parts.push(`<blockquote><p>${quote}</p></blockquote>`);
      continue;
    }

    const paragraph = lines.map((line) => escapeMarkdownInline(line)).join("<br>");
    parts.push(`<p>${paragraph}</p>`);
  }

  flushList();
  return parts.join("\n");
}

export function stripContentToText(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[>#*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function getBaseUrl(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || req.protocol || "https";

  return `${protocol}://${req.get("host")}`;
}

export function ensureAbsoluteUrl(baseUrl: string, value?: string | null): string {
  if (!value) return `${baseUrl}/og-image-v2.png`;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

export function formatDateIso(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatDateDisplay(value?: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getPrimaryTranslation(post: any, requestedLanguage?: string | null) {
  const normalizedRequested = requestedLanguage?.trim().toLowerCase();
  const translations = Array.isArray(post?.translations) ? post.translations : [];

  if (normalizedRequested) {
    const requested = translations.find(
      (translation: any) => translation?.language?.trim().toLowerCase() === normalizedRequested,
    );
    if (requested) return requested;
  }

  const defaultLanguage = post?.defaultLanguage?.trim().toLowerCase();
  if (defaultLanguage) {
    const primary = translations.find(
      (translation: any) => translation?.language?.trim().toLowerCase() === defaultLanguage,
    );
    if (primary) return primary;
  }

  if (translations.length > 0) return translations[0];

  return {
    language: post?.defaultLanguage || "English",
    title: post?.title || "Untitled",
    subtitle: post?.subtitle || "",
    content: post?.content || "",
    readingTime: post?.readingTime || "",
  };
}

export function buildPostDescription(post: any, translation: any): string {
  const candidates = [
    translation?.subtitle,
    post?.subtitle,
    stripContentToText(translation?.content),
    stripContentToText(post?.content),
  ].filter(Boolean) as string[];

  return truncateText(candidates[0] || "Read the latest article on Multilingual CMS.", 160);
}

export function toJsonLd(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/<\//g, "<\\/");
}
