
import { auth } from "@/lib/auth";
import { getAIStatus } from "@/lib/ai-usage";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        try {
            const status = await getAIStatus(session.user.id);
            return NextResponse.json(status);
        } catch (dbError) {
            console.error("Database status fetch failed, returning default:", dbError);
            // Return a safe default if the table doesn't exist yet
            return NextResponse.json({
                isPremium: false,
                remainingPlans: 3,
                remainingScans: 3,
                remainingTransit: 3,
                remainingTranslator: 20,
                remainingPoster: 3,
                remainingMedical: 3,
                planLimit: 3,
                scanLimit: 3,
                transitLimit: 3,
                translatorLimit: 20,
                posterLimit: 3,
                medicalLimit: 3
            });
        }

    } catch (error) {
        console.error("AI Status Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
