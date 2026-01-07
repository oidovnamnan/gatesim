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
import { Mail, Receipt, AlertTriangle, RotateCcw, Copy, RefreshCw } from "lucide-react";
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
        if (!order?.contactEmail) return;

        setActionLoading("email");
        try {
            const res = await fetch("/api/orders/actions/resend-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id, email: order.contactEmail })
            });

            if (!res.ok) throw new Error("Failed to send email");

            toast({
                title: "Email Sent",
                description: `Confirmation email sent to ${order.contactEmail}`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to send email. Check logs.",
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefund = async () => {
        if (!confirm("Are you sure you want to initiate a full refund? THIS ACTION IS PERMANENT.")) return;
        setActionLoading("refund");

        try {
            const res = await fetch("/api/orders/actions/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id })
            });

            if (!res.ok) throw new Error("Refund failed");

            toast({
                title: "Refund Initiated",
                description: `Refund processed successfully.`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to process refund. Check backend logs.",
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRetryProvisioning = async () => {
        setActionLoading("retry");
        try {
            const res = await fetch("/api/orders/actions/retry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: order.id })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Retry failed");
            }

            toast({
                title: "Provisioning Retried",
                description: "Success! Order should be completed now.",
                variant: 'default',

            });
            onOpenChange(false); // Close sheet to force refresh or just let subscription update
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Retry Failed",
                description: error.message || "Failed to retry. Check details.",
                variant: "destructive"
            });
        } finally {
            setActionLoading(null);
        }
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

                        {(order.status === 'PROVISIONING_FAILED' || order.status === 'paid') && (
                            <Button
                                variant="outline"
                                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-none col-span-2"
                                onClick={handleRetryProvisioning}
                                disabled={!!actionLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${actionLoading === "retry" ? "animate-spin" : ""}`} />
                                {actionLoading === "retry" ? "Retrying..." : "Retry Provisioning"}
                            </Button>
                        )}
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


                    {/* Provisioning Error (If Failed) */}
                    {(order.status === 'PROVISIONING_FAILED' || order.status === 'failed' || order.metadata?.provisioningError) && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-red-400 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Provisioning Error
                            </h4>
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-sm text-red-200">
                                <p className="font-bold mb-1">System Error:</p>
                                <code className="block whitespace-pre-wrap break-all bg-black/30 p-2 rounded text-xs font-mono">
                                    {typeof order.metadata?.provisioningError === 'string'
                                        ? order.metadata.provisioningError
                                        : JSON.stringify(order.metadata?.provisioningError || "Unknown Error")}
                                </code>
                            </div>
                        </div>
                    )}

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
