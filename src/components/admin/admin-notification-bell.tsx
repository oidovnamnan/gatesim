"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Bell, ShoppingCart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Order } from "@/types/db";
import { useRouter } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const MAX_NOTIFICATIONS = 10;

export function AdminNotificationBell() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);

    // Load last seen timestamp from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("admin_notif_last_seen");
        if (stored) {
            setLastSeenTimestamp(parseInt(stored, 10));
        }
    }, []);

    // Subscribe to recent orders
    useEffect(() => {
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            orderBy("createdAt", "desc"),
            limit(MAX_NOTIFICATIONS)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(newOrders);
        });

        return () => unsubscribe();
    }, []);

    // Count unread (newer than lastSeenTimestamp)
    const unreadCount = orders.filter(o => o.createdAt > lastSeenTimestamp).length;

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Mark all as seen when closing (or maybe when opening? usually when opening for notifications)
            // Let's keep logic: mark as seen when opening or closing?
            // The previous logic was: if (!isOpen) { mark... } inside handleOpen (which toggled).
            // So previously: click -> toggle(true) -> nothing. click again -> toggle(false) -> mark seen.
            // Wait, usually you mark seen immediately when opening.
            // Let's stick to the previous logic style or improve it.
            // IF we want to clear the "red dot" only AFTER they've seen it, usually on Open is better.
            // But let's check previous code:
            // if (!isOpen) { mark seen } -> This meant when CLOSING it marked as seen.

            // Let's change to: Mark as seen when OPENING. It makes more sense UX wise.
            // But if the user wants strictly previous behavior:
            if (!open) { // Closing
                const now = Date.now();
                setLastSeenTimestamp(now);
                localStorage.setItem("admin_notif_last_seen", now.toString());
            }
        }
    };

    const handleOrderClick = (orderId: string) => {
        setIsOpen(false);
        router.push(`/admin/orders`);
    };

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase();
        if (s === "COMPLETED") return "bg-emerald-500";
        if (s === "PAID" || s === "PROVISIONING") return "bg-blue-500";
        if (s === "PROVISIONING_FAILED") return "bg-red-500";
        return "bg-amber-500";
    };

    const formatTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return "Саяхан";
        if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} цаг`;
        return `${Math.floor(seconds / 86400)} өдөр`;
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "relative p-2 rounded-lg transition-colors outline-none",
                        isOpen
                            ? "bg-slate-200 dark:bg-white/10"
                            : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                >
                    <Bell className="w-5 h-5 text-slate-600 dark:text-white/70" />

                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-[#0d111c]">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            {/* 
                align="start" aligns with left edge of trigger (bad for right sidebar)
                align="end" aligns with right edge of trigger (good for right sidebar) 
                side="bottom" puts it below
                sideOffset={10} adds space
            */}
            <PopoverContent
                align="start"
                side="bottom"
                className="w-80 p-0 rounded-xl shadow-xl border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">
                        Сүүлийн захиалгууд
                    </h3>
                </div>

                {/* Orders List */}
                <div className="max-h-80 overflow-y-auto">
                    {orders.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                            Захиалга байхгүй
                        </div>
                    ) : (
                        orders.map((order) => (
                            <button
                                key={order.id}
                                onClick={() => handleOrderClick(order.id)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left border-b border-slate-50 dark:border-slate-800 last:border-0",
                                    order.createdAt > lastSeenTimestamp && "bg-blue-50/50 dark:bg-blue-900/10"
                                )}
                            >
                                {/* Icon */}
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                    getStatusColor(order.status)
                                )}>
                                    <ShoppingCart className="w-4 h-4 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {order.items?.[0]?.name || "eSIM Package"}
                                        </span>
                                        <span className="text-xs text-slate-400 flex-shrink-0">
                                            {formatTimeAgo(order.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatPrice(order.totalAmount, order.currency)}
                                        </span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-medium">
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <button
                    onClick={() => {
                        setIsOpen(false);
                        router.push("/admin/orders");
                    }}
                    className="w-full px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                    Бүх захиалгыг харах →
                </button>
            </PopoverContent>
        </Popover>
    );
}
