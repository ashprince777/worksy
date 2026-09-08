import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function getDatabaseUrl(): string {
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.NOW_REGION);

  if (isServerless) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    let needsInit = true;
    try {
      if (fs.existsSync(tmpDbPath)) {
        const stats = fs.statSync(tmpDbPath);
        if (stats.size > 0) {
          needsInit = false;
        }
      }
    } catch {
      needsInit = true;
    }

    if (needsInit) {
      const sourceDb = path.join(process.cwd(), "prisma", "dev.db");
      let restored = false;

      try {
        if (fs.existsSync(sourceDb)) {
          fs.copyFileSync(sourceDb, tmpDbPath);
          try {
            fs.chmodSync(tmpDbPath, 0o666);
          } catch {}
          restored = true;
        }
      } catch {}

      if (!restored) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const fallback = require("./dev-db-base64.json");
          if (fallback?.dbBase64) {
            fs.writeFileSync(tmpDbPath, Buffer.from(fallback.dbBase64, "base64"));
            try {
              fs.chmodSync(tmpDbPath, 0o666);
            } catch {}
          }
        } catch (e) {
          console.error("[DB] Failed restoring fallback database:", e);
        }
      }
    }

    return "file:/tmp/dev.db";
  }

  // Local development / build: use absolute normalized path to avoid Prisma CWD ambiguity
  const localDb = path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");
  return `file:${localDb}`;
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
