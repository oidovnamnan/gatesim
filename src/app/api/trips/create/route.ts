import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { destination, duration, purpose, budget, itinerary, userId } = body;

        // Note: session.user.id check is good but strict validation depends on how session is populated
        // The client sends userId but we should trust session.user.id primarily

        const newTrip = {
            userId: (session.user as any).id || session.user.email, // Fallback to email if ID missing, or trust client if safe (not safe)
            destination,
            duration,
            purpose,
            budget,
            itinerary,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "trips"), newTrip);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("Error saving trip:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
