"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
    DollarSign,
    Users,
    ShoppingBag,
    Zap,
    MoreHorizontal,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import Link from "next/link";

interface DashboardStats {
    totalRevenue: number;
    activeUsers: number;
    newOrders: number;
    activeEsims: number;
}

interface Order {
    id: string;
    orderNumber?: string;
    contactEmail?: string;
    contactName?: string;
    status: string;
    totalAmount?: number;
    createdAt?: { seconds: number };
    package?: {
        name?: string;
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        activeUsers: 0,
        newOrders: 0,
        activeEsims: 0,
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to orders for stats and recent orders
        const ordersRef = collection(db, "orders");
        const recentOrdersQuery = query(ordersRef, orderBy("createdAt", "desc"), limit(5));

        const unsubscribe = onSnapshot(recentOrdersQuery, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            setRecentOrders(orders);
            setLoading(false);
        });

        // Calculate stats from all orders
        const allOrdersQuery = query(ordersRef);
        const unsubscribeStats = onSnapshot(allOrdersQuery, (snapshot) => {
            let totalRevenue = 0;
            let newOrders = 0;
            let activeEsims = 0;
            const uniqueUsers = new Set<string>();

            const now = Date.now();
            const oneDayAgo = now - 24 * 60 * 60 * 1000;

            snapshot.docs.forEach(doc => {
                const data = doc.data();

                // Count revenue from completed/paid orders
                if (data.status === "completed" || data.status === "paid") {
                    totalRevenue += data.totalAmount || 0;
                    activeEsims++;
                }

                // Count unique users
                if (data.contactEmail) {
                    uniqueUsers.add(data.contactEmail);
                }
                if (data.userId) {
                    uniqueUsers.add(data.userId);
                }

                // Count orders from last 24 hours
                const createdAt = data.createdAt?.seconds * 1000 || 0;
                if (createdAt > oneDayAgo) {
                    newOrders++;
                }
            });

            setStats({
                totalRevenue,
                activeUsers: uniqueUsers.size,
                newOrders,
                activeEsims,
            });
        });

        return () => {
            unsubscribe();
            unsubscribeStats();
        };
    }, []);

    const formatTimeAgo = (timestamp?: { seconds: number }) => {
        if (!timestamp || typeof timestamp.seconds !== 'number') return "Unknown";
        const seconds = Math.floor((Date.now() - timestamp.seconds * 1000) / 1000);
        if (seconds < 60) return `${seconds} секундын өмнө`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} минутын өмнө`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} цагийн өмнө`;
        const days = Math.floor(hours / 24);
        return `${days} өдрийн өмнө`;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "paid":
                return "bg-emerald-500/10 text-emerald-400";
            case "processing":
            case "pending":
                return "bg-amber-500/10 text-amber-400";
            case "failed":
            case "cancelled":
                return "bg-red-500/10 text-red-400";
            default:
                return "bg-slate-500/10 text-slate-400";
        }
    };

    const statCards = [
        {
            title: "Нийт орлого",
            value: `₮${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
        },
        {
            title: "Нийт хэрэглэгч",
            value: stats.activeUsers.toString(),
            icon: Users,
        },
        {
            title: "Шинэ захиалга (24ц)",
            value: stats.newOrders.toString(),
            icon: ShoppingBag,
        },
        {
            title: "Идэвхтэй eSIM",
            value: stats.activeEsims.toString(),
            icon: Zap,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Хяналтын Самбар</h1>
                <p className="text-slate-400">Системийн ерөнхий төлөв байдал.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="p-4 bg-slate-900/50 border-slate-800 hover:border-blue-500/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <stat.icon className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-sm text-slate-500">{stat.title}</p>
                    </Card>
                ))}
            </div>

            {/* Recent Orders */}
            <Card className="bg-slate-900/50 border-slate-800 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Сүүлийн захиалгууд</h3>
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            Бүгдийг харах
                        </Button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            Захиалга байхгүй байна
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                    <th className="pb-3 pl-2">Захиалга ID</th>
                                    <th className="pb-3">Хэрэглэгч</th>
                                    <th className="pb-3">Багц</th>
                                    <th className="pb-3">Дүн</th>
                                    <th className="pb-3">Төлөв</th>
                                    <th className="pb-3">Хугацаа</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2 font-mono text-blue-400">
                                            {order.orderNumber || order.id.slice(0, 8)}
                                        </td>
                                        <td className="py-4 font-medium text-white">
                                            {order.contactName || order.contactEmail?.split("@")[0] || "Guest"}
                                        </td>
                                        <td className="py-4">{order.package?.name || "N/A"}</td>
                                        <td className="py-4 font-mono">
                                            ₮{(order.totalAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-500">{formatTimeAgo(order.createdAt)}</td>
                                        <td className="py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
}
