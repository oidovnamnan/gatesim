import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { destination, duration, purpose, budget, itinerary, userId } = body;

        if (!userId || userId !== session.user.id) {
            // Basic security check: ensure the userId in body matches session (or just use session id)
            // Ideally we just use session.user.id and ignore body.userId
        }

        const newTrip = {
            userId: session.user.id, // Enforce session user ID
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
