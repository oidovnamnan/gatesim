import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "@/lib/notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

export function NotificationManager() {
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
        <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSubscribed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>
                <div>
                    <div className="font-bold text-foreground">Мэдэгдэл</div>
                    <div className="text-xs text-muted-foreground">
                        {isSubscribed ? "Идэвхтэй: Дата дуусах сануулга ирнэ" : "Идэвхжүүлж чухал сануулгууд авах"}
                    </div>
                </div>
            </div>
            <Button
                variant={isSubscribed ? "outline" : "default"}
                onClick={handleToggle}
                disabled={processing}
                size="sm"
                className={isSubscribed ? "" : "bg-blue-600 hover:bg-blue-700"}
            >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSubscribed ? "Зогсоох" : "Идэвхжүүлэх")}
            </Button>
        </Card>
    );
}
