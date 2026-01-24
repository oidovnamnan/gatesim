
import { auth } from "@/lib/auth";
import { getAIStatus } from "@/lib/ai-usage";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const status = await getAIStatus(session.user.id);
        return NextResponse.json(status);

    } catch (error) {
        console.error("AI Status Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
