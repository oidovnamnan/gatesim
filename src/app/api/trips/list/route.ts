
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // 🔐 AUTHENTICATION CHECK
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 🔐 AUTHORIZATION CHECK
        const sessionUserId = (session.user as any).id;
        if (sessionUserId !== userId) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const tripsRef = collection(db, "trips");
        const q = query(
            tripsRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const trips = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ trips });

    } catch (error: any) {
        console.error("API Get Trips Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch trips" },
            { status: 500 }
        );
    }
}
