"use client";

import { useState, useEffect } from "react";
import { Users, ShoppingCart, Calendar, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { UsersTable } from "./users-table";
import { UserSheet, EnrichedUser } from "./user-sheet";

export default function UsersPage() {
    const [users, setUsers] = useState<EnrichedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        setLoading(true);

        const usersRef = collection(db, "users");
        // We fetch ALL users initially for client-side search/sort.
        // In a huge app, this should be server-side paginated via API.
        const usersQuery = query(usersRef);

        const unsubUsers = onSnapshot(usersQuery, (userSnap) => {
            const tempUsers: Record<string, EnrichedUser> = {};

            userSnap.docs.forEach(doc => {
                const data = doc.data();
                tempUsers[doc.id] = {
                    ...(data as any),
                    id: doc.id,
                    orderCount: 0,
                    totalSpent: 0,
                    orders: []
                };
            });

            // Listen to Orders to aggregate stats
            const ordersRef = collection(db, "orders");
            const ordersQuery = query(ordersRef);

            const unsubOrders = onSnapshot(ordersQuery, (orderSnap) => {
                // Reset counts in temp object to avoid double counting on updates
                Object.values(tempUsers).forEach(u => {
                    u.orderCount = 0;
                    u.totalSpent = 0;
                    u.orders = [];
                });

                orderSnap.docs.forEach(doc => {
                    const order = doc.data();
                    const uid = order.userId;
                    const email = order.contactEmail;
                    const orderData = { id: doc.id, ...order };

                    // Match by UID or Email
                    let userMatch = null;
                    if (uid && tempUsers[uid]) {
                        userMatch = tempUsers[uid];
                    } else if (email) {
                        userMatch = Object.values(tempUsers).find(u => u.email === email);
                    }

                    if (userMatch) {
                        userMatch.orderCount++;
                        if (order.status === "paid" || order.status === "completed") {
                            userMatch.totalSpent += (order.totalAmount || 0);
                        }
                        // Add to local orders list for sheet view
                        userMatch.orders?.push(orderData);
                    }
                });

                // Convert back to array and sort
                const sortedUsers = Object.values(tempUsers).sort((a, b) => {
                    return (b.createdAt || 0) - (a.createdAt || 0);
                });

                // Sort orders within each user for display
                sortedUsers.forEach(u => {
                    u.orders?.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                });

                setUsers(sortedUsers);
                setLoading(false);
            });

            return () => unsubOrders();
        });

        return () => unsubUsers();
    }, []);

    // Derived Stats
    const stats = {
        total: users.length,
        withOrders: users.filter(u => u.orderCount > 0).length,
        newThisMonth: users.filter(u => {
            if (!u.createdAt) return false;
            const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            return u.createdAt > monthAgo;
        }).length,
    };

    const handleUserClick = (user: EnrichedUser) => {
        setSelectedUser(user);
        setSheetOpen(true);
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Users Management
                        <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            {users.length}
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage registered users and view their activity
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.withOrders}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Active Customers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.newThisMonth}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">New This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <UsersTable
                users={users}
                loading={loading}
                onUserClick={handleUserClick}
            />

            {/* User Details Sheet */}
            <UserSheet
                user={selectedUser}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
