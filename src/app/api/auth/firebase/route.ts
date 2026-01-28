import { auth } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!adminAuth) {
            console.error("Firebase Admin not initialized");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const userId = (session.user as any).id || session.user.email;

        if (!userId) {
            return NextResponse.json({ error: "User ID missing" }, { status: 400 });
        }

        // Create a custom token for this user
        // We can also add additional claims here if needed
        const customToken = await adminAuth.createCustomToken(userId, {
            role: (session.user as any).role || "user"
        });

        return NextResponse.json({ token: customToken });
    } catch (error) {
        console.error("Error generating custom token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
