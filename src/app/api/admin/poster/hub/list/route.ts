import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hubRef = collection(db, "ai_hub");
        const q = query(hubRef, orderBy("createdAt", "desc"), limit(50));
        const snapshot = await getDocs(q);

        const posters = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({
            success: true,
            posters
        });

    } catch (error: any) {
        console.error("Hub list error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
