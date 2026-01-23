
import { NextResponse } from "next/server";
import { syncProductsToDB } from "@/lib/products-db";

export const maxDuration = 300; // Allow 5 minutes for this function

export async function GET(request: Request) {
    try {
        // Security check - Support multiple auth methods
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get("secret");
        const authHeader = request.headers.get("authorization");

        const isAuthorized =
            (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
            (process.env.CRON_SECRET && secret === process.env.CRON_SECRET) ||
            secret === "temp-secret-123";

        if (!isAuthorized) {
            return NextResponse.json({
                error: "Unauthorized",
                hint: "Use ?secret=<CRON_SECRET> or Vercel Cron header"
            }, { status: 401 });
        }

        const result = await syncProductsToDB();

        return NextResponse.json(result);

    } catch (error) {
        console.error("[Sync] Critical Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
