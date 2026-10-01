import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { buildSeoMeta, injectSeo } from "./seo";
import { buildBootstrapState, getBootstrapJson, renderPrerenderedHtml } from "./render";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.get(/^(?!\/api).*/, async (req, res) => {
    try {
      const templatePath = path.resolve(distPath, "index.html");
      const template = await fs.promises.readFile(templatePath, "utf-8");
      const meta = await buildSeoMeta(req);
      const bootstrap = await buildBootstrapState(req);
      const forwardedProto = req.headers["x-forwarded-proto"];
      const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol;
      const baseUrl = `${protocol}://${req.get("host")}`;
      const prerenderedApp = renderPrerenderedHtml(req, bootstrap, baseUrl);
      const html = injectSeo(template, meta, {
        structuredData: meta.structuredData,
        prerenderedApp,
        bootstrapJson: getBootstrapJson(bootstrap),
      });
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      console.error("Static: Error serving index.html", error);
      res.status(500).send("Internal Server Error");
    }
  });
}
