import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    Timestamp,
    onSnapshot
} from "firebase/firestore";
import { UserData, Order } from "@/types/db";

// --- User Operations ---

export async function createOrUpdateUser(user: UserData) {
    if (!user.uid) return;
    const userRef = doc(db, "users", user.uid);
    // Merge true allows updating existing fields without overwriting the whole doc
    await setDoc(userRef, {
        ...user,
        updatedAt: Date.now()
    }, { merge: true });
}

export async function getUserProfile(uid: string): Promise<UserData | null> {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        return snap.data() as UserData;
    }
    return null;
}

// --- Order Operations ---

// Replaced direct Firestore call with API call to support China users (Bypass Firewall)
export async function createOrder(order: Order) {
    // We send the order data to our own API
    const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create order");
    }

    const data = await res.json();
    return data.order as Order;
}

export async function updateOrderStatus(orderId: string, status: Order["status"], extraData?: Partial<Order>) {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status,
        updatedAt: Date.now(),
        ...extraData
    });
}

// Replaced direct Firestore query with API call
export async function getUserOrders(userId: string): Promise<Order[]> {
    const res = await fetch(`/api/orders/list?userId=${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        // Fallback to empty array or throw error depending on UX preference.
        // For now, logging and returning empty array prevents page crash.
        console.error("Failed to fetch orders via API");
        return [];
    }

    const data = await res.json();
    return data.orders as Order[];
}

// --- Admin Operations ---

export function subscribeToOrders(callback: (orders: Order[]) => void) {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
    });
}

export async function getAllOrders(limitCount = 50): Promise<Order[]> {
    // Requires index for complex queries, keeping it simple for now
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q); // Add limit(limitCount) later
    return snapshot.docs.map(doc => doc.data() as Order);
}

// --- System Operations ---

export function subscribeToSystemConfig(callback: (config: any) => void) {
    return onSnapshot(doc(db, "system", "config"), (doc) => {
        callback(doc.data() || {});
    });
}

export async function updateSystemConfig(data: any) {
    await setDoc(doc(db, "system", "config"), data, { merge: true });
}
