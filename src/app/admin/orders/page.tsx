"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Search, Filter, Eye, Loader2, RefreshCw, Download } from "lucide-react";
import { subscribeToOrders } from "@/lib/db";
import { Order } from "@/types/db";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { OrderDetailsSheet } from "@/components/admin/orders/order-details-sheet";

const statusStyles: Record<string, "default" | "success" | "warning" | "destructive"> = {
    completed: "success",
    paid: "success",
    pending: "warning",
    processing: "warning",
    failed: "destructive",
    refunded: "default"
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        setLoading(true);
        // Real-time subscription
        const unsubscribe = subscribeToOrders((newOrders) => {
            setOrders(newOrders);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    };

    const filteredOrders = orders.filter(order => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
            order.id.toLowerCase().includes(lowerSearch) ||
            order.contactEmail.toLowerCase().includes(lowerSearch) ||
            (order.items[0]?.name || "").toLowerCase().includes(lowerSearch);

        const matchesStatus = statusFilter === "all" || order.status?.toUpperCase() === statusFilter.toUpperCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
                <p className="text-slate-500 dark:text-slate-400">Real-time order tracking from Firebase</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm dark:shadow-none">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/40" />
                    <Input
                        placeholder="Search by ID, email or package..."
                        className="pl-9 h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-white/40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 items-center">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                            <Filter className="w-4 h-4 mr-2 text-slate-500 dark:text-white/50" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PROVISIONING">Provisioning</SelectItem>
                            <SelectItem value="PROVISIONING_FAILED">Failed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleRefresh} disabled={loading} className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button className="h-10 rounded-lg bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-white/90 text-white dark:text-black font-medium">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-white/80 min-w-[800px]">
                        <thead className="bg-slate-50 dark:bg-[#11141d] text-slate-700 dark:text-white font-medium border-b border-slate-200 dark:border-white/10">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">User / Contact</th>
                                <th className="px-6 py-4">Package</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                                            <p className="text-slate-500 dark:text-white/50">Loading orders...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-white/50">
                                        {searchTerm || statusFilter !== 'all' ? 'No matching orders found.' : 'No orders found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => {
                                    const item = order.items[0];
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-blue-600 dark:text-white/70 truncate max-w-[150px]" title={order.id}>
                                                {order.id.slice(0, 12)}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 dark:text-white">{order.contactEmail}</div>
                                                <div className="text-xs text-slate-500 dark:text-white/50">{order.userId !== 'guest' ? 'Registered' : 'Guest'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900 dark:text-white">{item?.name || 'Unknown Package'}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                {formatPrice(order.totalAmount, order.currency)}
                                                <div className="text-xs text-slate-500 dark:text-white/40 font-normal mt-0.5 uppercase">{order.paymentMethod}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={statusStyles[order.status] || "default"}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-white/60">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-white/10"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsSheet
                order={selectedOrder}
                open={!!selectedOrder}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
            />
        </div>
    )
}
