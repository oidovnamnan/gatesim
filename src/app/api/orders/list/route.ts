
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Order } from "@/types/db";
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
                { error: "Нэвтрээгүй байна" },
                { status: 401 }
            );
        }

        // 🔐 AUTHORIZATION CHECK - User can only see their own orders
        // Compare session user ID with requested userId
        const sessionUserId = (session.user as any).id;
        if (sessionUserId !== userId) {
            console.warn(`User ${sessionUserId} attempted to access orders for ${userId}`);
            return NextResponse.json(
                { error: "Хандах эрхгүй" },
                { status: 403 }
            );
        }

        const ordersRef = collection(db, "orders");
        // Firestore query performs on the server (Vercel), so it bypasses China firewall
        const q = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => doc.data() as Order);

        return NextResponse.json({ orders });

    } catch (error: any) {
        console.error("API Get Orders Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

