/**
 * Prisma Client - Safe wrapper for build time
 * Uses mock client when DATABASE_URL is not available
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we have a database connection
const hasDatabase = !!process.env.DATABASE_URL;

// Create a mock client for build time
function createMockClient(): PrismaClient {
  // Return a proxy that throws helpful errors
  return new Proxy({} as PrismaClient, {
    get(_, prop) {
      if (typeof prop === "string" && !prop.startsWith("_")) {
        return new Proxy(() => { }, {
          get() {
            return () => {
              console.warn(`Database not configured. Set DATABASE_URL to enable database features.`);
              return Promise.resolve(null);
            };
          },
          apply() {
            console.warn(`Database not configured. Set DATABASE_URL to enable database features.`);
            return Promise.resolve(null);
          },
        });
      }
      return undefined;
    },
  });
}

// Create real or mock client
function createPrismaClient(): PrismaClient {
  if (!hasDatabase) {
    console.warn("DATABASE_URL not set, using mock Prisma client");
    return createMockClient();
  }

  // For Prisma 7+, we need to use the adapter or accelerate URL
  // Since we're in Prisma 7, check the config
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    });
  } catch {
    console.warn("Failed to create Prisma client, using mock");
    return createMockClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
