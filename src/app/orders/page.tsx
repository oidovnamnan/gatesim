"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, QrCode } from "lucide-react";
import { getUserOrders } from "@/lib/db";
import { Order } from "@/types/db";
import { formatPrice } from "@/lib/utils";

export default function OrdersPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
            return;
        }

        if (user) {
            const fetchMyOrders = async () => {
                try {
                    const data = await getUserOrders(user.uid);
                    setOrders(data);
                } catch (error) {
                    console.error("Failed to fetch orders", error);
                } finally {
                    setFetching(false);
                }
            };
            fetchMyOrders();
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <div className="min-h-screen pb-24">
            <MobileHeader title="Миний захиалгууд" showBack />

            <div className="px-4 pt-4 space-y-4">
                {fetching ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-white/30" />
                        </div>
                        <h3 className="text-white font-medium mb-1">Захиалга алга</h3>
                        <p className="text-white/50 text-sm mb-6">Та одоогоор ямар нэгэн багц худалдаж аваагүй байна.</p>
                        <Button onClick={() => router.push("/packages")}>Багц сонгох</Button>
                    </div>
                ) : (
                    orders.map((order) => {
                        const item = order.items[0];
                        return (
                            <Card key={order.id} className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-white">{item?.name}</h3>
                                        <p className="text-xs text-white/50 font-mono">{order.id.slice(0, 8)}...</p>
                                    </div>
                                    <Badge variant={order.status === 'completed' ? 'success' : 'default'}>
                                        {order.status === 'completed' ? 'Идэвхтэй' : order.status}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-white/60">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <span className="text-white font-bold">{formatPrice(order.totalAmount, order.currency)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" size="sm" fullWidth>Дэлгэрэнгүй</Button>
                                    {order.status === 'completed' && (
                                        <Button size="sm" fullWidth onClick={() => alert("QR Code Modal Here")}>
                                            <QrCode className="w-4 h-4 mr-2" />
                                            QR Код
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}
