import type { Request, Response } from "express";
import { storage } from "./storage";
import {
  buildPostDescription,
  ensureAbsoluteUrl,
  escapeHtml,
  formatDateIso,
  getBaseUrl,
  getPrimaryTranslation,
  renderContentToHtml,
} from "./seo-utils";

function toRfc822(value?: string | Date | null): string {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

export async function sendFeedXml(req: Request, res: Response) {
  const baseUrl = getBaseUrl(req);
  const posts = (await storage.getPosts({ published: true })).slice(0, 25);
  const selfUrl = `${baseUrl}/feed.xml`;
  const siteTitle = "Multilingual CMS";
  const siteDescription = "A multilingual publishing platform for focused long-form writing and editorial workflows.";
  const latestDate = posts[0]?.updatedAt || posts[0]?.publishedAt || posts[0]?.createdAt || new Date();

  const items = posts
    .map((post) => {
      const translation = getPrimaryTranslation(post);
      const title = translation?.title || post.title || "Untitled";
      const description = buildPostDescription(post, translation);
      const link = `${baseUrl}/post/${encodeURIComponent(post.slug)}`;
      const content = renderContentToHtml(translation?.content || post.content || "");
      const image = ensureAbsoluteUrl(baseUrl, post.coverImage || "/og-image-v2.png");

      return `
        <item>
          <title>${escapeHtml(title)}</title>
          <link>${escapeHtml(link)}</link>
          <guid isPermaLink="true">${escapeHtml(link)}</guid>
          <pubDate>${escapeHtml(toRfc822(post.publishedAt || post.createdAt))}</pubDate>
          <description>${cdata(description)}</description>
          <content:encoded>${cdata(content)}</content:encoded>
          <enclosure url="${escapeHtml(image)}" type="image/png" />
        </item>
      `;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeHtml(siteTitle)}</title>
    <link>${escapeHtml(baseUrl)}</link>
    <description>${escapeHtml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${escapeHtml(toRfc822(latestDate))}</lastBuildDate>
    <atom:link href="${escapeHtml(selfUrl)}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  res.status(200).type("application/rss+xml").send(xml);
}
