"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "@/lib/notifications";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { useAuth } from "@/providers/auth-provider";

export function AdminNotificationToggle() {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        async function checkStatus() {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                setLoading(false);
                return;
            }

            try {
                // Check if admin has a stored subscription
                const subRef = doc(db, "admin_push_subscriptions", user!.uid);
                const snap = await getDoc(subRef);

                if (snap.exists()) {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    if (subscription) {
                        setIsSubscribed(true);
                    } else {
                        // Desync - browser doesn't have it anymore
                        setIsSubscribed(false);
                        await deleteDoc(subRef);
                    }
                } else {
                    setIsSubscribed(false);
                }
            } catch (e) {
                console.error("Check admin notification status error:", e);
            } finally {
                setLoading(false);
            }
        }

        checkStatus();
    }, [user]);

    const handleToggle = async () => {
        if (!user) return;

        setProcessing(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            if (isSubscribed) {
                // Unsubscribe
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
                await deleteDoc(doc(db, "admin_push_subscriptions", user.uid));
                setIsSubscribed(false);
                success("Захиалгын мэдэгдэл хаалаа.");
            } else {
                // Subscribe
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    error("Мэдэгдэл хүлээн авах зөвшөөрөл олгогдоогүй байна.");
                    setProcessing(false);
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

                // Save to admin_push_subscriptions collection
                await setDoc(doc(db, "admin_push_subscriptions", user.uid), {
                    endpoint: subscription.endpoint,
                    keys: subscription.toJSON().keys,
                    userAgent: navigator.userAgent,
                    email: user.email,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });

                setIsSubscribed(true);
                success("🔔 Захиалгын мэдэгдэл идэвхжлээ! Шинэ захиалга орж ирэхэд танд мэдэгдэл ирнэ.");
            }
        } catch (e) {
            console.error("Admin notification toggle error:", e);
            error("Үйлдэл амжилтгүй боллоо.");
        } finally {
            setProcessing(false);
        }
    };

    // Don't render if not supported or loading
    if (loading) return null;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;

    return (
        <button
            onClick={handleToggle}
            disabled={processing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSubscribed
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
        >
            {processing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isSubscribed ? (
                <Bell className="w-3.5 h-3.5" />
            ) : (
                <BellOff className="w-3.5 h-3.5" />
            )}
            {isSubscribed ? "Мэдэгдэл ON" : "Мэдэгдэл OFF"}
        </button>
    );
}
