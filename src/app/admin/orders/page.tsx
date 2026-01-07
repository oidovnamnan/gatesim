"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Search, Filter, Eye, Loader2, RefreshCw } from "lucide-react";
import { subscribeToOrders } from "@/lib/db";
import { Order } from "@/types/db";

const statusStyles: Record<string, "default" | "success" | "warning" | "destructive"> = {
    completed: "success",
    paid: "success",
    pending: "warning",
    processing: "warning",
    failed: "destructive",
    refunded: "default"
};

import { OrderDetailsSheet } from "@/components/admin/orders/order-details-sheet";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    // Manual refresh is no longer strictly needed but kept just in case
    const handleRefresh = () => {
        // With onSnapshot, refresh is automatic. 
        // We could force re-subscribe or just ignore.
        setLoading(true);
        // Re-subscription happens automatically if we don't destroy it.
        // For UI feedback, let's just timeout.
        setTimeout(() => setLoading(false), 500);
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items[0]?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                    <p className="text-white/60">Real-time order tracking from Firebase</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
                    <Button>Export CSV</Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                    placeholder="Search orders by ID, email or package..."
                    className="pl-9 bg-white/5 border-white/10 text-white w-full md:w-96"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <table className="w-full text-sm text-left text-white/80">
                    <thead className="bg-[#11141d] text-white font-medium border-b border-white/10">
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
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                                        <p className="text-white/50">Loading orders...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => {
                                const item = order.items[0];
                                return (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-white/70 truncate max-w-[150px]" title={order.id}>
                                            {order.id.slice(0, 12)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{order.contactEmail}</div>
                                            <div className="text-xs text-white/50">{order.userId !== 'guest' ? 'Registered' : 'Guest'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{item?.name || 'Unknown Package'}</div>
                                            <div className="text-xs text-white/50">{item?.sku}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {formatPrice(order.totalAmount, order.currency)}
                                            <div className="text-xs text-white/40 font-normal mt-0.5 uppercase">{order.paymentMethod}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={statusStyles[order.status] || "default"}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-white/60">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="w-4 h-4 text-blue-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <OrderDetailsSheet
                order={selectedOrder}
                open={!!selectedOrder}
                onOpenChange={(open) => !open && setSelectedOrder(null)}
            />
        </div>
    )
}
