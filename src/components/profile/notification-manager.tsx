import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "@/lib/notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

export function NotificationManager({ className }: { className?: string }) {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!user) return;

        async function checkStatus() {
            if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                setLoading(false);
                return;
            }

            try {
                // Check if user has a stored subscription in Firestore
                const subRef = doc(db, "push_subscriptions", user!.uid);
                const snap = await getDoc(subRef);

                if (snap.exists()) {
                    // Check if browser also has it
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.getSubscription();
                    if (subscription) {
                        setIsSubscribed(true);
                    } else {
                        // Desync: firestore says yes, browser says no.
                        setIsSubscribed(false);
                        await deleteDoc(subRef);
                    }
                } else {
                    setIsSubscribed(false);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        checkStatus();
    }, [user]);

    const handleToggle = async () => {
        setProcessing(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            if (isSubscribed) {
                // Unsubscribe
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                }
                // Remove from DB
                await deleteDoc(doc(db, "push_subscriptions", user!.uid));
                setIsSubscribed(false);
                success("Мэдэгдэл идэвхгүй боллоо.");
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

                // Save to DB
                await setDoc(doc(db, "push_subscriptions", user!.uid), {
                    endpoint: subscription.endpoint,
                    keys: subscription.toJSON().keys,
                    userAgent: navigator.userAgent,
                    updatedAt: Date.now()
                });

                setIsSubscribed(true);
                success("Мэдэгдэл идэвхжлээ! Танд чухал мэдээлэл цаг алдалгүй ирэх болно.");
            }
        } catch (e) {
            console.error(e);
            error("Үйлдэл амжилтгүй боллоо.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return null;

    return (
        <div className={`flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors p-2 rounded-lg ${className || ""}`}>
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isSubscribed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                    <div className="font-semibold text-sm text-foreground">Мэдэгдэл</div>
                    <div className="text-[10px] text-muted-foreground">
                        {isSubscribed ? "Идэвхтэй" : "Идэвхжүүлэх"}
                    </div>
                </div>
            </div>
            <div
                onClick={handleToggle}
                className={`relative w-10 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${isSubscribed ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${isSubscribed ? 'translate-x-4' : 'translate-x-0'}`}>
                    {processing && <Loader2 className="w-3 h-3 text-blue-500 animate-spin m-0.5" />}
                </div>
            </div>
        </div>
    );
}
