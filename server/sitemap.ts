import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

const STATIC_SITEMAP_PATHS = [
  "/",
  "/archive",
  "/about",
  "/now",
  "/terms",
  "/disclaimers",
  "/privacy",
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getBaseUrl(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || req.protocol || "https";

  return `${protocol}://${req.get("host")}`;
}

function findPublicFile(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), "dist", "public", filename),
    path.join(process.cwd(), "client", "public", filename),
    path.join(process.cwd(), "public", filename),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function toIsoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

export async function sendSitemapXml(req: Request, res: Response) {
  const baseUrl = getBaseUrl(req);
  const urls: Array<{ loc: string; lastmod?: string }> = STATIC_SITEMAP_PATHS.map((pathname) => ({
    loc: `${baseUrl}${pathname}`,
  }));

  try {
    const publishedPosts = await storage.getPosts({ published: true });
    const latestPublished = publishedPosts[0];
    const latestPublishedLastmod = toIsoDate(
      latestPublished?.updatedAt ?? latestPublished?.publishedAt ?? latestPublished?.createdAt,
    );

    urls.forEach((entry) => {
      if (entry.loc === `${baseUrl}/` || entry.loc === `${baseUrl}/archive`) {
        entry.lastmod = latestPublishedLastmod;
      }
    });

    const tagLastmods = new Map<string, string | undefined>();

    for (const post of publishedPosts) {
      if (!post?.slug) continue;

      const postLastmod = toIsoDate(post.updatedAt ?? post.publishedAt ?? post.createdAt);
      urls.push({
        loc: `${baseUrl}/post/${encodeURIComponent(post.slug)}`,
        lastmod: postLastmod,
      });

      for (const tag of post.tags || []) {
        if (!tag) continue;
        const loc = `${baseUrl}/tags/${encodeURIComponent(tag)}`;
        if (!tagLastmods.has(loc) && postLastmod) {
          tagLastmods.set(loc, postLastmod);
        }
      }
    }

    for (const [loc, lastmod] of tagLastmods.entries()) {
      urls.push({ loc, lastmod });
    }
  } catch (error) {
    console.error(
      "Sitemap: failed to load published posts, serving static URLs only.",
      error,
    );
  }

  const uniqueUrls = Array.from(
    new Map(urls.map((entry) => [entry.loc, entry])).values(),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueUrls
    .map(
      (entry) => `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""}\n  </url>`,
    )
    .join("\n")}\n</urlset>\n`;

  res.status(200).type("application/xml").send(xml);
}

export function sendRobotsTxt(_req: Request, res: Response) {
  const robotsPath = findPublicFile("robots.txt");

  if (!robotsPath) {
    return res.status(404).type("text/plain").send("robots.txt not found\n");
  }

  return res.type("text/plain").sendFile(robotsPath);
}
