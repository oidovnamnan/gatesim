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
import { Mail, Receipt, AlertTriangle, RotateCcw, Copy, RefreshCw, CreditCard, User, Calendar, Box } from "lucide-react";
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
        if (order.status?.toUpperCase() === 'PENDING') {
            if (!window.confirm("АНХААР: Энэ захиалга PENDING төлөвтэй байна. Төлбөр орсон эсэхийг та шалгасан уу?\n\n'OK' дарвал төлбөр шалгахгүйгээр ШУУД Provision хийгдэнэ.")) {
                setActionLoading(null);
                return;
            }
        }

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
            <SheetContent side="center" className="w-full max-w-2xl overflow-y-auto bg-slate-950 border-white/10 text-white p-6 md:p-8">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-white flex items-center gap-2">
                        Order Details
                        <Badge variant="outline" className="ml-2 font-mono text-xs border-white/20 text-white/60">#{order.id.slice(0, 8)}</Badge>
                    </SheetTitle>
                    <SheetDescription className="text-white/40">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-white/50 mb-1">Total Amount</div>
                            <div className="text-2xl font-bold text-emerald-400">
                                {formatPrice(order.totalAmount, order.currency)}
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                            <div className="text-sm text-white/50 mb-2">Current Status</div>
                            <div>
                                <Badge className={`uppercase ${order.status?.toUpperCase() === 'COMPLETED' || order.status?.toUpperCase() === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                                    order.status?.toUpperCase() === 'PROVISIONING_FAILED' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                        'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                    }`}>
                                    {order.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
                            <User className="w-4 h-4" /> Customer & Payment
                        </h4>
                        <div className="bg-white/5 rounded-xl border border-white/5 divide-y divide-white/5">
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-sm text-white/50">Email</span>
                                <div className="flex items-center gap-2 text-sm font-medium text-white hover:text-blue-400 cursor-pointer" onClick={() => handleCopy(order.contactEmail)}>
                                    {order.contactEmail}
                                    <Copy className="w-3 h-3 opacity-50" />
                                </div>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-sm text-white/50">Payment Method</span>
                                <span className="text-sm text-white uppercase font-medium">{order.paymentMethod}</span>
                            </div>
                            {order.paymentId && (
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-sm text-white/50">Transaction ID</span>
                                    <span className="text-xs font-mono text-white/60">{order.paymentId.slice(0, 16)}...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
                            <Box className="w-4 h-4" /> Order Items
                        </h4>
                        <div className="bg-white/5 rounded-xl border border-white/5 p-1">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                        <Box className="w-6 h-6 text-slate-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{item.name}</div>
                                        <div className="text-xs text-white/40 truncate">{item.sku}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">{formatPrice(item.price, order.currency)}</div>
                                        <div className="text-xs text-white/40">x{item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Display */}
                    {(order.status?.toUpperCase() === 'PROVISIONING_FAILED' || order.metadata?.provisioningError) && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                                <AlertTriangle className="w-4 h-4" /> Provisioning Error
                            </div>
                            <code className="block text-xs font-mono text-red-300/80 bg-black/20 p-2 rounded whitespace-pre-wrap break-all">
                                {typeof order.metadata?.provisioningError === 'string'
                                    ? order.metadata.provisioningError
                                    : JSON.stringify(order.metadata?.provisioningError || "Unknown Error")}
                            </code>
                        </div>
                    )}

                    <Separator className="bg-white/10" />

                    {/* Actions Grid */}
                    <div>
                        <h4 className="text-sm font-medium text-white/50 mb-3">Actions</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                                onClick={handleResendEmail}
                                disabled={!!actionLoading}
                            >
                                <Mail className="w-5 h-5 text-blue-400" />
                                <span className="text-xs">Resend Email</span>
                            </Button>

                            {(order.status?.toUpperCase() === 'PROVISIONING_FAILED' || order.status?.toUpperCase() === 'PAID' || order.status?.toUpperCase() === 'PENDING') && (

                                <Button
                                    variant="outline"
                                    className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                                    onClick={handleRetryProvisioning}
                                    disabled={!!actionLoading}
                                >
                                    <RefreshCw className={`w-5 h-5 text-amber-400 ${actionLoading === 'retry' ? 'animate-spin' : ''}`} />
                                    <span className="text-xs">Retry Provision</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-red-500/5 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 col-span-2"
                                onClick={handleRefund}
                                disabled={!!actionLoading}
                            >
                                <RotateCcw className="w-5 h-5 text-red-500" />
                                <span className="text-xs text-red-400">Refund Full Order</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
