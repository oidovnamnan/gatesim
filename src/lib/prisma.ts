/**
 * Prisma Client for GateSIM
 * Optimized for both Node.js and Edge Runtime (Next.js 16/Turbopack)
 */

import { neonConfig } from "@neondatabase/serverless";

// Global type for singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

let prismaInstance: any;

if (process.env.NEXT_RUNTIME === 'edge') {
  // Edge runtime - Prisma client with Neon adapter can be tricky in some versions
  // If we are here, we might want to use a dummy or a very specific edge client
  // For now, let's provide a proxy or dummy to avoid "Module not found"
  prismaInstance = new Proxy({}, {
    get: () => {
      throw new Error("Prisma cannot be used directly in the Edge runtime in this configuration. Use API routes instead.");
    }
  });
} else {
  // Node.js runtime
  const { PrismaClient } = require("@prisma/client");
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const ws = require("ws");

  if (typeof window === 'undefined') {
    neonConfig.webSocketConstructor = ws;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set!");
  }

  const adapter = new PrismaNeon({ connectionString });

  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;
export default prisma;
