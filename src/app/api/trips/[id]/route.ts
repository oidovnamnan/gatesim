import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Missing trip ID" }, { status: 400 });
        }

        const docRef = doc(db, "trips", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const tripData = docSnap.data();

        // Remove sensitive info if any (though trips are currently public-by-link)
        return NextResponse.json({
            success: true,
            trip: {
                id: docSnap.id,
                ...tripData
            }
        });
    } catch (error) {
        console.error("Error fetching trip:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
