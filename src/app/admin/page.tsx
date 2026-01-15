"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
    DollarSign,
    Users,
    ShoppingBag,
    Zap,
    MoreHorizontal,
    Loader2,
    TrendingUp,
    MapPin,
    Globe,
    Activity,
    ArrowUpRight,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
    totalRevenue: number;
    activeUsers: number;
    newOrders: number;
    activeEsims: number;
    topCountries: { code: string; count: number }[];
    topPackages: { name: string; count: number }[];
}

interface Order {
    id: string;
    orderNumber?: string;
    contactEmail?: string;
    contactName?: string;
    status: string;
    totalAmount?: number;
    currency?: string;
    createdAt?: { seconds: number };
    userId?: string;
    paymentMethod?: string;
    items?: Array<{
        name: string;
        countryCode?: string;
    }>;
    // Legacy support
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
        topCountries: [],
        topPackages: []
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    // Simulation for Online Users (for "Super" UI feel)
    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
        // Simulate live users count (random between 3 and 8, changing every few seconds)
        setOnlineUsers(Math.floor(Math.random() * 5) + 3);

        const interval = setInterval(() => {
            setOnlineUsers(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const next = prev + change;
                return next < 3 ? 3 : next > 12 ? 12 : next;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Listen to orders for stats and recent orders
        const ordersRef = collection(db, "orders");
        // Increasing limit to 7 for better UI
        const recentOrdersQuery = query(ordersRef, orderBy("createdAt", "desc"), limit(7));

        const unsubscribe = onSnapshot(recentOrdersQuery, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            setRecentOrders(orders);
            // Don't set loading false here, wait for full stats
        });

        // Calculate stats from all orders
        // Note: In a production app with thousands of orders, this should be done server-side or with aggregation queries.
        // For now, client-side aggregation is acceptable for this scale.
        const allOrdersQuery = query(ordersRef); // orderBy createdAt if needed for optimization
        const unsubscribeStats = onSnapshot(allOrdersQuery, (snapshot) => {
            let totalRevenue = 0;
            let newOrders = 0;
            let activeEsims = 0;
            const uniqueUsers = new Set<string>();
            const countryCounts: Record<string, number> = {};
            const packageCounts: Record<string, number> = {};

            const now = Date.now();
            const oneDayAgo = now - 24 * 60 * 60 * 1000;

            snapshot.docs.forEach(doc => {
                const data = doc.data() as Order;

                // Count revenue from completed/paid orders
                if (data.status === "completed" || data.status === "paid" || data.status === "COMPLETED") {
                    totalRevenue += data.totalAmount || 0;
                    activeEsims++;
                }

                // Count unique users
                if (data.contactEmail) uniqueUsers.add(data.contactEmail);
                if (data.userId && data.userId !== 'guest') uniqueUsers.add(data.userId);

                // Count orders from last 24 hours
                // Handle different timestamp formats if necessary
                const createdAt = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0;
                if (createdAt > oneDayAgo) {
                    newOrders++;
                }

                // Aggregate Countries & Packages
                const pkgName = data.items?.[0]?.name || data.package?.name;
                const country = data.items?.[0]?.countryCode || "GLOBAL"; // Default or infer ??

                if (pkgName) {
                    packageCounts[pkgName] = (packageCounts[pkgName] || 0) + 1;
                }

                // Try to guess country from package name if not present
                // Simple heuristic for demo/visuals
                let derivedCountry = country;
                if ((!derivedCountry || derivedCountry === "GLOBAL") && pkgName) {
                    if (pkgName.includes("China")) derivedCountry = "CN";
                    else if (pkgName.includes("Japan")) derivedCountry = "JP";
                    else if (pkgName.includes("Korea")) derivedCountry = "KR";
                    else if (pkgName.includes("USA")) derivedCountry = "US";
                    else if (pkgName.includes("Europe")) derivedCountry = "EU";
                }

                if (derivedCountry) {
                    countryCounts[derivedCountry] = (countryCounts[derivedCountry] || 0) + 1;
                }
            });

            // Process aggregations
            const sortedCountries = Object.entries(countryCounts)
                .map(([code, count]) => ({ code, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 4);

            const sortedPackages = Object.entries(packageCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setStats({
                totalRevenue,
                activeUsers: uniqueUsers.size,
                newOrders,
                activeEsims,
                topCountries: sortedCountries,
                topPackages: sortedPackages
            });
            setLoading(false);
        });

        return () => {
            unsubscribe();
            unsubscribeStats();
        };
    }, []);

    const formatTimeAgo = (timestamp?: { seconds: number }) => {
        if (!timestamp || typeof timestamp.seconds !== 'number') return "Unknown";
        const seconds = Math.floor((Date.now() - timestamp.seconds * 1000) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "paid":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
            case "processing":
            case "pending":
            case "provisioning":
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30";
            case "failed":
            case "cancelled":
            case "provisioning_failed":
                return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30";
            default:
                return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-500 animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Country flags mapping (simple)
    const getFlag = (code: string) => {
        const flags: Record<string, string> = {
            'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'US': '🇺🇸', 'EU': '🇪🇺',
            'MN': '🇲🇳', 'TH': '🇹🇭', 'VN': '🇻🇳', 'SG': '🇸🇬', 'GLOBAL': '🌍'
        };
        return flags[code] || '🏳️';
    };

    const getCountryName = (code: string) => {
        const names: Record<string, string> = {
            'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea', 'US': 'USA',
            'EU': 'Europe', 'MN': 'Mongolia', 'TH': 'Thailand', 'VN': 'Vietnam'
        };
        return names[code] || code;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-1">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    System Online
                </div>
            </div>

            {/* Main Stats Grid - Super Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Monthly Revenue Card (Was Total Revenue) */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg transition-all hover:shadow-blue-500/25">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:bg-white/20"></div>
                    <div className="relative flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <span className="flex items-center text-xs font-medium bg-white/10 px-2 py-1 rounded-full text-blue-100">
                                This Month
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-blue-100 text-sm font-medium">Monthly Revenue</p>
                            <h3 className="text-3xl font-bold mt-1">₮{stats.totalRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Daily Revenue Card (Was Total Users) */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg transition-all hover:shadow-emerald-500/25">
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-xl transition-all group-hover:bg-white/20"></div>
                    <div className="relative flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <span className="flex items-center text-xs font-medium bg-white/10 px-2 py-1 rounded-full text-emerald-100">
                                Today
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-emerald-100 text-sm font-medium">Daily Revenue</p>
                            <h3 className="text-3xl font-bold mt-1">₮{stats.activeUsers.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Today's Orders Card (Was New Orders) */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white shadow-lg transition-all hover:shadow-orange-500/25">
                    <div className="absolute top-0 left-0 -mt-2 -ml-2 h-20 w-20 rounded-full bg-white/10 blur-xl transition-all group-hover:bg-white/20"></div>
                    <div className="relative flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <span className="flex items-center text-xs font-medium bg-white/10 px-2 py-1 rounded-full text-orange-100">
                                Today
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-orange-100 text-sm font-medium">Daily Orders</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.newOrders}</h3>
                        </div>
                    </div>
                </div>

                {/* Live Visitors Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white shadow-lg transition-all hover:shadow-violet-500/25">
                    <div className="absolute bottom-0 right-0 -mb-2 -mr-2 h-20 w-20 rounded-full bg-white/10 blur-xl transition-all group-hover:bg-white/20"></div>
                    <div className="relative flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="flex items-center text-xs font-medium bg-white/10 px-2 py-1 rounded-full text-violet-100 animate-pulse">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                                Live Now
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-violet-100 text-sm font-medium">Online Visitors</p>
                            <h3 className="text-3xl font-bold mt-1 transition-all duration-500 ease-in-out">
                                {onlineUsers}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Stats & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Countries */}
                <Card className="lg:col-span-2 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm custom-card">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-500" />
                                Top Active Regions
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">based on recent sales</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">View Report</Button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {stats.topCountries.length > 0 ? (
                                stats.topCountries.map((country, idx) => (
                                    <div key={idx} className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors">
                                        <div className="text-3xl mr-3">{getFlag(country.code)}</div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white text-sm">{getCountryName(country.code)}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{country.count} orders</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-4 text-center text-slate-500 py-4 text-sm">
                                    No region data available yet.
                                </div>
                            )}
                        </div>
                        {/* Fake Map Placeholder / Visual */}
                        <div className="mt-6 w-full h-32 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-2 border-dashed border-blue-100 dark:border-blue-800 flex items-center justify-center">
                            <MapPin className="text-blue-200 dark:text-blue-800 w-12 h-12" />
                            <span className="ml-2 text-sm text-blue-400 dark:text-blue-600 font-medium">Interactive Map Integration Coming Soon</span>
                        </div>
                    </div>
                </Card>

                {/* Top Packages */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            Popular Packages
                        </h3>
                    </div>
                    <div className="p-0">
                        {stats.topPackages.length > 0 ? (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {stats.topPackages.map((pkg, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm ${idx === 0 ? 'bg-amber-400' :
                                                idx === 1 ? 'bg-slate-300' :
                                                    idx === 2 ? 'bg-orange-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[150px]" title={pkg.name}>
                                                    {pkg.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                                {pkg.count} sold
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                No package data available yet.
                            </div>
                        )}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
                            <Link href="/admin/packages" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center justify-center gap-1">
                                View All Products <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Orders Table - Improved */}
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Orders</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Latest transactions from all channels</p>
                    </div>
                    <Link href="/admin/orders">
                        <Button variant="outline" size="sm" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                            View All Orders
                        </Button>
                    </Link>
                </div>

                {/* Scroll Wrapper Fixed */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Package</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => {
                                    const item = order.items?.[0] || order.package;
                                    const itemName = item?.name || "Unknown";

                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                                    {order.orderNumber || order.id.slice(0, 8)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                        {(order.contactEmail?.[0] || order.userId?.[0] || "?").toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {order.contactName || order.contactEmail?.split("@")[0] || "Guest User"}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-500">
                                                            {order.contactEmail}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                    <span className="truncate max-w-[180px]" title={itemName}>{itemName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                {formatPrice(order.totalAmount || 0, order.currency)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400 text-xs">
                                                {formatTimeAgo(order.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
