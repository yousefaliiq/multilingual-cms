import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import cookieSession from "cookie-session";
import { createHash, timingSafeEqual } from "crypto";

function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export async function ensureInitialAdmin() {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be configured");
  }
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "local-development-only");

  if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be configured in production");
  }

  app.use(
    cookieSession({
      name: "cms_session",
      keys: [sessionSecret],
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    }) as any
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy((username, password, done) => {
      try {
        const expectedUser = process.env.ADMIN_USERNAME || "";
        const expectedPassword = process.env.ADMIN_PASSWORD || "";
        if (!safeEqual(username, expectedUser) || !safeEqual(password, expectedPassword)) {
          return done(null, false);
        }
        return done(null, { id: 1, username: expectedUser });
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));
}
