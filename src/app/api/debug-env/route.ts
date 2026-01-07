
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? "DEFINED (" + process.env.AUTH_GOOGLE_ID.substring(0, 5) + "...)" : "MISSING",
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? "DEFINED" : "MISSING",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "DEFINED" : "MISSING",
        AUTH_SECRET: process.env.AUTH_SECRET ? "DEFINED" : "MISSING",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL : "MISSING",
        NODE_ENV: process.env.NODE_ENV,
    });
}
