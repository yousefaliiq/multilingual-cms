// script/build.ts
import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, copyFile, access } from "fs/promises";
import { constants as fsConstants } from "fs";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@supabase/supabase-js",
  "connect-pg-simple",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-session",
  "passport",
  "passport-local",
  "pg",
  "react",
  "react-dom",
  "react-markdown",
  "remark-gfm",
  "zod",
];

async function copyConnectPgSimpleTableSql() {
  const candidates = [
    "node_modules/connect-pg-simple/table.sql",
    "node_modules/connect-pg-simple/dist/table.sql",
    "node_modules/connect-pg-simple/lib/table.sql",
  ];

  for (const src of candidates) {
    try {
      await access(src, fsConstants.F_OK);
      await copyFile(src, "dist/table.sql");
      console.log(`[build] Copied connect-pg-simple table.sql -> dist/table.sql`);
      return;
    } catch {
      // try next path
    }
  }

  console.warn(
    "[build] WARNING: Could not find connect-pg-simple table.sql. Session table auto-create may fail."
  );
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  await copyConnectPgSimpleTableSql();
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
