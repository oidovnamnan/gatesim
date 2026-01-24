
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import "dotenv/config";

// Configure WebSocket for Node.js environment
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set!");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Checking for AI_PASS package...");

    // We try to find by ID or airaloPackageId
    const existing = await prisma.package.findFirst({
        where: { OR: [{ id: "AI_PASS" }, { airaloPackageId: "AI_PASS" }] }
    });

    if (existing) {
        console.log("AI_PASS package already exists.");
        return;
    }

    console.log("Creating AI_PASS package...");
    await prisma.package.create({
        data: {
            id: "AI_PASS",
            airaloPackageId: "AI_PASS",
            slug: "ai-pass",
            type: "digital_service",
            netPrice: 0,
            retailPrice: 25000,
            ourPrice: 25000,
            currency: "MNT",
            title: "GateSIM AI Pass",
            data: "Unlimited",
            dataAmount: 0,
            validityDays: 30,
            operatorTitle: "GateSIM AI",
            countries: ["MN"],
            isFeatured: false,
            isActive: true
        }
    });

    console.log("✅ AI_PASS package created successfully!");
}

main()
    .catch((e) => {
        console.error("Error creating AI package:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
