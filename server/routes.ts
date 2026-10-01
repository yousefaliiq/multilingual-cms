import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, ensureInitialAdmin } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { submitIndexNow } from "./indexnow";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);
  await ensureInitialAdmin();

  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  app.post("/api/upload", isAuthenticated, async (req, res) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const secretKey = process.env.SUPABASE_SECRET_KEY;
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

      if (!supabaseUrl || !secretKey) {
        return res.status(503).json({ message: "Image storage is not configured" });
      }

      const { fileData } = req.body as { fileData?: string };
      const match = fileData?.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ message: "A valid image is required" });
      }

      const mimeType = match[1];
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.length > 6 * 1024 * 1024) {
        return res.status(413).json({ message: "Image must be 6 MB or smaller" });
      }

      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };
      const extension = extensionMap[mimeType] || "img";
      const objectPath = `posts/${Date.now()}-${randomUUID()}.${extension}`;

      const supabase = createClient(supabaseUrl, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await supabase.storage
        .from(bucket)
        .upload(objectPath, bytes, { contentType: mimeType, upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      return res.json({ url: data.publicUrl });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Upload failed" });
    }
  });

  const getBaseUrl = (req: any) => {
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || "https";
    return `${protocol}://${req.get("host")}`;
  };

  const maybeSubmitIndexNow = (req: any, urls: string[]) => {
    if (!urls.length) return;
    const absoluteUrls = urls.map((url) => {
      if (/^https?:\/\//i.test(url)) return url;
      const baseUrl = getBaseUrl(req);
      return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
    });

    void submitIndexNow(Array.from(new Set(absoluteUrls)));
  };

  // AUTH LOGIN
  app.post(api.auth.login.path, async (req, res, next) => {
    try {

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
      }

      passport.authenticate("local", (err: any, user: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ success: false, message: "Login failed" });
        }
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json({ success: true, id: user.id, username: user.username });
        });
      })(req, res, next);
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, isAuthenticated, (req, res) => {
    const user = req.user as any;
    res.json({ id: user.id, username: user.username });
  });

  // POSTS LIST
  app.get(api.posts.list.path, async (req, res) => {
    try {

      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;
      const tag = req.query.tag as string | undefined;
      const data = await storage.getPosts({ published, tag });
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal error" });
    }
  });

  // GET SINGLE POST
  app.get(api.posts.get.path, async (req, res) => {
    try {
      const post = await storage.getPostBySlug(req.params.slug);
      if (!post || (!post.published && !req.isAuthenticated?.())) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal error" });
    }
  });

  // CREATE POST
  app.post(api.posts.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.posts.create.input.parse(req.body);
      const post = await storage.createPost(input);
      if (post?.published && post?.slug) {
        maybeSubmitIndexNow(req, [`/post/${post.slug}`, "/", "/archive"]);
      }
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Internal error" });
    }
  });

  // UPDATE POST
  app.put(api.posts.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const previousPost = await storage.getPost(id);
      const input = api.posts.update.input.parse(req.body);
      const post = await storage.updatePost(id, input);

      const urls = ["/", "/archive"];
      if (post?.slug) urls.push(`/post/${post.slug}`);
      if (previousPost?.slug && previousPost.slug !== post?.slug) urls.push(`/post/${previousPost.slug}`);
      if (post?.published || previousPost?.published) {
        maybeSubmitIndexNow(req, urls);
      }

      res.json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Internal error" });
    }
  });

  // DELETE POST
  app.delete(api.posts.delete.path, isAuthenticated, async (req, res) => {
    try {
      const previousPost = await storage.getPost(Number(req.params.id));
      await storage.deletePost(Number(req.params.id));
      if (previousPost?.slug) {
        maybeSubmitIndexNow(req, [`/post/${previousPost.slug}`, "/", "/archive"]);
      }
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal error" });
    }
  });

  return httpServer;
}
