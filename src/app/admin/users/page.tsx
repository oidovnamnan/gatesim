"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, ShoppingCart, Shield, Loader2, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Input } from "@/components/ui/input";

// Simple relative time formatter
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Өнөөдөр";
    if (days === 1) return "Өчигдөр";
    if (days < 7) return `${days} өдрийн өмнө`;
    if (days < 30) return `${Math.floor(days / 7)} долоо хоногийн өмнө`;
    if (days < 365) return `${Math.floor(days / 30)} сарын өмнө`;
    return `${Math.floor(days / 365)} жилийн өмнө`;
}

interface UserData {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role?: string;
    createdAt?: number;
    emailVerified?: boolean;
    phone?: string;
    // Aggregated stats
    orderCount: number;
    totalSpent: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setLoading(true);

        // 1. Listen to Users
        const usersRef = collection(db, "users");
        // Note: 'createdAt' in Firebase might be missing on old users, so order might be tricky.
        // We'll sort client side.
        const usersQuery = query(usersRef);

        const unsubUsers = onSnapshot(usersQuery, (userSnap) => {
            const tempUsers: Record<string, UserData> = {};
            userSnap.docs.forEach(doc => {
                const data = doc.data();
                tempUsers[doc.id] = {
                    id: doc.id,
                    email: data.email || "",
                    displayName: data.displayName || data.name,
                    photoURL: data.photoURL || data.image,
                    role: data.role,
                    createdAt: data.createdAt,
                    emailVerified: data.emailVerified,
                    phone: data.phone,
                    orderCount: 0,
                    totalSpent: 0
                };
            });

            // 2. Listen to Orders to aggregate stats
            const ordersRef = collection(db, "orders");
            // Fetch ALL orders (might be heavy later, but fine for now)
            // Optimization: We could use a separate aggregate query if Firebase supported it cleanly on client
            const ordersQuery = query(ordersRef);

            // We use a one-time fetch for orders to avoid double-stream complexity? 
            // No, let's stream both.
            const unsubOrders = onSnapshot(ordersQuery, (orderSnap) => {
                // Reset counts
                Object.values(tempUsers).forEach(u => {
                    u.orderCount = 0;
                    u.totalSpent = 0;
                });

                orderSnap.docs.forEach(doc => {
                    const order = doc.data();
                    const uid = order.userId;
                    // Also match by email if userId is missing (Guest orders linked by email)
                    const email = order.contactEmail;

                    if (uid && tempUsers[uid]) {
                        tempUsers[uid].orderCount++;
                        if (order.status === "paid" || order.status === "completed") {
                            tempUsers[uid].totalSpent += (order.totalAmount || 0);
                        }
                    } else if (email) {
                        // Find user by email
                        const userByEmail = Object.values(tempUsers).find(u => u.email === email);
                        if (userByEmail) {
                            userByEmail.orderCount++;
                            if (order.status === "paid" || order.status === "completed") {
                                userByEmail.totalSpent += (order.totalAmount || 0);
                            }
                        }
                    }
                });

                // Sort by CreatedAt desc
                const sortedUsers = Object.values(tempUsers).sort((a, b) => {
                    return (b.createdAt || 0) - (a.createdAt || 0);
                });

                setUsers(sortedUsers);
                setLoading(false);
            });

            return () => unsubOrders();
        });

        return () => unsubUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: users.length,
        withOrders: users.filter(u => u.orderCount > 0).length,
        newThisMonth: users.filter(u => {
            if (!u.createdAt) return false;
            const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            return u.createdAt > monthAgo;
        }).length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Users Management
                        <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                            {users.length}
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Бүртгэлтэй хэрэглэгчдийг удирдах
                    </p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Хайх..."
                        className="pl-9 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-sm text-slate-400">Нийт хэрэглэгч</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.withOrders}</p>
                            <p className="text-sm text-slate-400">Захиалга хийсэн</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.newThisMonth}</p>
                            <p className="text-sm text-slate-400">Энэ сард шинэ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">Хэрэглэгч</th>
                                <th className="px-4 py-3 font-medium">Имэйл</th>
                                <th className="px-4 py-3 font-medium text-center">Захиалга</th>
                                <th className="px-4 py-3 font-medium text-right">Нийт төлбөр</th>
                                <th className="px-4 py-3 font-medium">Бүртгэгдсэн</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Хэрэглэгч олдсонгүй
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt={user.displayName || "User"}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-white">
                                                            {user.displayName || "Нэргүй"}
                                                        </p>
                                                        {user.role === 'super_admin' && (
                                                            <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-0 text-[10px] px-1.5 h-4 flex items-center gap-1">
                                                                <Shield className="w-2.5 h-2.5" />
                                                                Admin
                                                            </Badge>
                                                        )}
                                                        {user.role === 'staff' && (
                                                            <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0 text-[10px] px-1.5 h-4 flex items-center gap-1">
                                                                <Shield className="w-2.5 h-2.5" />
                                                                Staff
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {user.phone && (
                                                        <p className="text-xs text-slate-500">{user.phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="text-slate-300">{user.email}</span>
                                                {user.emailVerified && (
                                                    <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-400 bg-emerald-500/10 h-4 px-1">
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.orderCount > 0 ? (
                                                <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-0">
                                                    {user.orderCount}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-500">0</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {user.totalSpent > 0 ? (
                                                <span className="font-medium text-emerald-400">
                                                    ₮{user.totalSpent.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-slate-400 text-xs">
                                                {user.createdAt ? formatRelativeTime(new Date(user.createdAt)) : "-"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
