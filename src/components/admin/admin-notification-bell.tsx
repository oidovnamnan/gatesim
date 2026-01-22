"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Bell, ShoppingCart, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Order } from "@/types/db";
import { useRouter } from "next/navigation";

const MAX_NOTIFICATIONS = 10;

export function AdminNotificationBell() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Count unread (newer than lastSeenTimestamp)
    const unreadCount = orders.filter(o => o.createdAt > lastSeenTimestamp).length;

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Mark all as seen
            const now = Date.now();
            setLastSeenTimestamp(now);
            localStorage.setItem("admin_notif_last_seen", now.toString());
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
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className={cn(
                    "relative p-2 rounded-lg transition-colors",
                    isOpen
                        ? "bg-slate-200 dark:bg-white/10"
                        : "hover:bg-slate-100 dark:hover:bg-white/5"
                )}
            >
                <Bell className="w-5 h-5 text-slate-600 dark:text-white/70" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            Сүүлийн захиалгууд
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
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
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase">
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
                        className="w-full px-4 py-3 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 border-t border-slate-100 dark:border-slate-800"
                    >
                        Бүх захиалгыг харах →
                    </button>
                </div>
            )}
        </div>
    );
}
