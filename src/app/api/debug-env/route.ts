import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    let dbStatus = "UNKNOWN";
    let dbError = null;
    let userCount = 0;

    try {
        // Try to query the database
        const users = await prisma.user.findMany({ take: 1 });
        userCount = users.length;
        dbStatus = "CONNECTED";
    } catch (error: unknown) {
        dbStatus = "FAILED";
        dbError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? "DEFINED (" + process.env.AUTH_GOOGLE_ID.substring(0, 5) + "...)" : "MISSING",
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? "DEFINED" : "MISSING",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "DEFINED" : "MISSING",
        AUTH_SECRET: process.env.AUTH_SECRET ? "DEFINED" : "MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : "MISSING",
        DATABASE_URL: process.env.DATABASE_URL ? "DEFINED (starts with: " + process.env.DATABASE_URL.substring(0, 25) + "...)" : "MISSING",
        DATABASE_STATUS: dbStatus,
        DATABASE_ERROR: dbError,
        USER_COUNT: userCount,
        NODE_ENV: process.env.NODE_ENV,
    });
}
