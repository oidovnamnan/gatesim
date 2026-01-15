"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";

function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sessionId] = useState(generateSessionId());

    useEffect(() => {
        // Function to update heartbeat
        const updateHeartbeat = async (user: any) => {
            try {
                const sessionRef = doc(db, "sessions", sessionId);
                await setDoc(sessionRef, {
                    lastSeen: serverTimestamp(),
                    path: pathname,
                    userId: user?.uid || "guest",
                    email: user?.email || null,
                    userAgent: navigator.userAgent
                }, { merge: true });
            } catch (err) {
                console.error("Presence heartbeat failed", err);
            }
        };

        // Initial update
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            updateHeartbeat(user);
        });

        // Loop for heartbeat every 30s
        const intervalId = setInterval(() => {
            updateHeartbeat(auth.currentUser);
        }, 30000);

        // Cleanup on unmount (tab close)
        const cleanup = () => {
            // Best effort delete
            // Note: Navigator.sendBeacon is better for reliable exit, but Firestore REST API is complex to auth there.
            // We rely on "lastSeen" query in Admin Dashboard to filter out stale sessions.
            const sessionRef = doc(db, "sessions", sessionId);
            deleteDoc(sessionRef).catch(() => { });
        };

        window.addEventListener("beforeunload", cleanup);

        return () => {
            clearInterval(intervalId);
            unsubscribeAuth();
            window.removeEventListener("beforeunload", cleanup);
            cleanup();
        };
    }, [pathname, sessionId]);

    return <>{children}</>;
}
