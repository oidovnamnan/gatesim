"use client";

import { useState } from "react";
import { Order } from "@/types/db";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Receipt, AlertTriangle, RotateCcw, Copy } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface OrderDetailsSheetProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({ order, open, onOpenChange }: OrderDetailsSheetProps) {
    const { toast } = useToast();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    if (!order) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: text });
    };

    const handleResendEmail = async () => {
        setActionLoading("email");
        // Mock API call
        await new Promise(r => setTimeout(r, 1000));
        toast({
            title: "Email Sent",
            description: `Confirmation email sent to ${order.contactEmail}`,
        });
        setActionLoading(null);
    };

    const handleRefund = async () => {
        if (!confirm("Are you sure you want to initiate a full refund?")) return;
        setActionLoading("refund");
        // Mock API call
        await new Promise(r => setTimeout(r, 1500));
        toast({
            title: "Refund Initiated",
            description: `Refund of ${formatPrice(order.totalAmount, order.currency)} processed.`,
            variant: "default", // Should be success ideally
        });
        setActionLoading(null);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-slate-950 border-white/10 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                        Order Details
                        <Badge variant="outline" className="ml-2 font-mono text-xs">{order.id.slice(0, 8)}</Badge>
                    </SheetTitle>
                    <SheetDescription className="text-white/60">
                        View and manage order #{order.id}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Actions Toolbar */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="text-white border-white/10 hover:bg-white/10"
                            onClick={handleResendEmail}
                            disabled={!!actionLoading}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {actionLoading === "email" ? "Sending..." : "Resend Email"}
                        </Button>
                        <Button
                            variant="danger"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-none"
                            onClick={handleRefund}
                            disabled={!!actionLoading}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {actionLoading === "refund" ? "Refunding..." : "Refund Order"}
                        </Button>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Customer Info */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-white/90 flex items-center gap-2">
                            <Receipt className="w-4 h-4" /> Customer Information
                        </h4>
                        <div className="bg-white/5 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/50">Email:</span>
                                <span className="text-white font-medium flex items-center gap-2 cursor-pointer hover:text-blue-400" onClick={() => handleCopy(order.contactEmail)}>
                                    {order.contactEmail} <Copy className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">User ID:</span>
                                <span className="font-mono">{order.userId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Date:</span>
                                <span>{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-white/90">Items</h4>
                        <div className="space-y-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-white/50 text-xs">{item.sku}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatPrice(item.price, order.currency)}</div>
                                        <div className="text-xs text-white/50">x{item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-white/90">Payment & Status</h4>
                        <div className="bg-white/5 p-4 rounded-lg space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/50">Total Amount:</span>
                                <span className="text-lg font-bold text-green-400">{formatPrice(order.totalAmount, order.currency)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/50">Status:</span>
                                <Badge variant={order.status === 'paid' ? 'success' : 'secondary'} className="uppercase">
                                    {order.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Method:</span>
                                <span className="uppercase">{order.paymentMethod}</span>
                            </div>
                            {order.paymentId && (
                                <div className="flex justify-between">
                                    <span className="text-white/50">Payment ID:</span>
                                    <span className="font-mono text-xs">{order.paymentId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Technical / Raw Data */}
                    <div className="pt-4">
                        <div className="flex items-center gap-2 text-amber-500/80 text-xs mb-2">
                            <AlertTriangle className="w-3 h-3" />
                            Raw Data (For Debugging)
                        </div>
                        <pre className="text-[10px] bg-black/50 p-4 rounded-lg overflow-x-auto font-mono text-white/40">
                            {JSON.stringify(order, null, 2)}
                        </pre>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
}
