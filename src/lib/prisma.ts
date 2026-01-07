/**
 * Prisma Client for GateSIM
 * Lazy initialization to avoid build-time issues
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization - only create client when first accessed
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set!");
    throw new Error("DATABASE_URL environment variable is not set!");
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Export as a getter to enable lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export default prisma;
