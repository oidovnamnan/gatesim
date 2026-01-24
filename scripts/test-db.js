
const { PrismaClient } = require('@prisma/client');
async function test() {
    const prisma = new PrismaClient();
    try {
        console.log("Connecting to DB...");
        const userCount = await prisma.user.count();
        console.log("Connected! User count:", userCount);

        console.log("Testing AiUsage...");
        const usage = await prisma.aiUsage.findFirst();
        console.log("AiUsage record found:", usage);
    } catch (err) {
        console.error("DB Error details:", err);
    } finally {
        await prisma.$disconnect();
    }
}
test();
