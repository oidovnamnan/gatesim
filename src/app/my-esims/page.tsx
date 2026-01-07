"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    QrCode,
    Copy,
    Check,
    Share,
    ChevronRight,
    Wifi,
    Clock,
    ExternalLink,
    Plus,
    X,
    Loader2,
    User
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryFlag, cn } from "@/lib/utils";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";
import { Order } from "@/types/db";

// Helper to format date
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + " " + new Date(timestamp).toLocaleTimeString();
};

type TabType = "active" | "history";

interface EsimCardProps {
    order: any;
    onSelect: () => void;
}

function EsimCard({ order, onSelect }: EsimCardProps) {
    const flag = getCountryFlag(order.countryCode);
    const isActive = order.status === "COMPLETED" && order.daysRemaining > 0;
    const isProcessing = order.status === "PAID" || order.status === "PROVISIONING";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div
                onClick={onSelect}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.98]"
            >
                <div className="flex items-start gap-4">
                    <div className="text-4xl shadow-sm rounded-xl overflow-hidden bg-slate-50">{flag}</div>
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 truncate text-lg">
                                {order.countryName}
                            </h3>
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                    isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        isProcessing ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            "bg-slate-100 text-slate-500 border-slate-200"
                                )}
                            >
                                {isActive ? "Идэвхтэй" : isProcessing ? "Хүлээж байна" : "Дууссан"}
                            </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">{order.packageName}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>

                {isActive && (
                    <div className="mt-5 pt-4 border-t border-slate-100">
                        {/* Data usage bar */}
                        {(() => {
                            const usagePercent = (order.dataUsed / (parseFloat(order.data) || 1)) * 100;
                            return (
                                <>
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                                        <span>Дата ашиглалт</span>
                                        <span className="text-slate-900">{order.dataUsed} GB <span className="text-slate-400 font-normal">/ {order.data}</span></span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                        />
                                    </div>
                                </>
                            );
                        })()}

                        {/* Remaining days */}
                        <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-900/80 px-3 py-2 rounded-xl border border-amber-100/50">
                            <Clock className="h-4 w-4 text-amber-500" />
                            <span className="font-medium">
                                {order.daysRemaining} хоног үлдсэн
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

interface EsimDetailModalProps {
    order: any;
    onClose: () => void;
}

function EsimDetailModal({ order, onClose }: EsimDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const flag = getCountryFlag(order.countryCode);

    const handleCopy = () => {
        navigator.clipboard.writeText(order.qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: `GateSIM - ${order.countryName} eSIM`,
                text: `eSIM суулгах код: ${order.qrCode}`,
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">eSIM Дэлгэрэнгүй</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>

                <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                    {/* Country Info */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="text-5xl shadow-sm rounded-2xl bg-white border border-slate-100 p-1">{flag}</div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-1">{order.countryName}</h2>
                            <Badge variant="outline" className="text-slate-500 font-medium border-slate-200">
                                {order.packageName}
                            </Badge>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100 flex flex-col items-center text-center">
                        <p className="text-slate-500 text-sm font-medium mb-4">
                            Доорх QR кодыг уншуулж eSIM-ээ идэвхжүүлээрэй
                        </p>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                            <QrCode className="w-40 h-40 text-slate-900" />
                        </div>
                        <p className="text-xs text-slate-400">
                            Код зөвхөн нэг удаа уншигдана
                        </p>
                    </div>

                    {/* Manual entry code */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-900 uppercase mb-2 ml-1">Гараар оруулах код</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                            <code className="flex-1 font-mono text-sm text-slate-700 truncate">
                                {order.qrCode}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCopy}
                                className={cn("rounded-lg h-8 w-8", copied ? "bg-emerald-100 text-emerald-600" : "hover:bg-slate-200 text-slate-500")}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* ICCID */}
                    <div className="mb-8">
                        <p className="text-xs font-bold text-slate-900 uppercase mb-2 ml-1">ICCID (Сериал дугаар)</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <code className="text-sm font-mono text-slate-600 tracking-wide">{order.iccid}</code>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" onClick={handleShare}>
                            <Share className="h-4 w-4 mr-2" />
                            Найздаа илгээх
                        </Button>
                        <Link href="https://support.apple.com/guide/iphone/set-up-an-esim-iph3dd5f213/ios" target="_blank" className="block">
                            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Суулгах заавар харах
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function MyEsimsPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("active");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const ordersRef = collection(db, "orders");

        let unsubUser = () => { };
        let unsubEmail = () => { };

        const userOrdersMap = new Map();
        const emailOrdersMap = new Map();

        const updateOrders = () => {
            const allOrders = [...userOrdersMap.values(), ...emailOrdersMap.values()];
            // Deduplicate by ID
            const uniqueOrdersMap = new Map();
            allOrders.forEach(o => uniqueOrdersMap.set(o.id, o));

            const uniqueOrders = Array.from(uniqueOrdersMap.values());

            // Sort by createdAt desc
            uniqueOrders.sort((a: any, b: any) => b.createdAt - a.createdAt);

            const formattedOrders = uniqueOrders.map((data: any) => {
                const esim = data.esim || {};
                const pkg = data.package || (data.items && data.items[0]) || {};
                const metadata = pkg.metadata || {};

                // Normalize status
                const status = (data.status || "pending").toUpperCase();

                // Determine Country Name & Code
                // Fallback priorities: pkg.countryName -> pkg.countries[0] -> metadata.country -> "Global"
                const countryName = pkg.countryName || (pkg.countries && pkg.countries[0]) || metadata.country || "Global";
                // We don't have code in metadata usually, so default to WO if generic
                const countryCode = (pkg.countries && pkg.countries[0]) || "WO";

                // Validity Calculation
                const validityDays = parseInt(pkg.durationDays || metadata.validity || "30");
                const created = new Date(data.createdAt || Date.now());
                const expiresAt = new Date(created.getTime() + validityDays * 24 * 60 * 60 * 1000);
                const now = new Date();
                const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

                // Data Formatting
                let dataAmountStr = "Unlimited";
                if (pkg.dataAmount) dataAmountStr = `${pkg.dataAmount / 1024} GB`;
                else if (metadata.data) dataAmountStr = metadata.data;

                return {
                    id: data.id,
                    orderNumber: (data.orderNumber || data.id).substring(0, 8).toUpperCase(),
                    status: status,
                    packageName: pkg.name || pkg.title || "Unknown Package",
                    countryCode: countryCode,
                    countryName: countryName,
                    data: dataAmountStr,
                    dataUsed: 0, // Mock usage for now
                    validityDays: validityDays,
                    daysRemaining: daysRemaining,
                    price: data.totalAmount,
                    qrCode: esim.qrData || esim.lpa || "Generating...",
                    iccid: esim.iccid || "Pending...",
                    createdAt: formatDate(data.createdAt),
                    raw: data
                };
            });

            setOrders(formattedOrders);
            setLoading(false);
        };

        // Listener 1: By User ID
        const userQuery = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        unsubUser = onSnapshot(userQuery, (snapshot) => {
            userOrdersMap.clear();
            snapshot.docs.forEach(doc => userOrdersMap.set(doc.id, { id: doc.id, ...doc.data() }));
            updateOrders();
        }, (error) => {
            console.error("Error fetching user orders:", error);
            setLoading(false);
        });

        // Listener 2: By Email (if available)
        if (user.email) {
            // Note: Simple query without orderBy to avoid index requirement for now
            const emailQuery = query(ordersRef, where("contactEmail", "==", user.email));

            unsubEmail = onSnapshot(emailQuery, (snapshot) => {
                emailOrdersMap.clear();
                snapshot.docs.forEach(doc => emailOrdersMap.set(doc.id, { id: doc.id, ...doc.data() }));
                updateOrders();
            }, (error) => {
                console.error("Error fetching email orders:", error);
                // Don't stop loading here, user orders might still come
            });
        }

        return () => {
            unsubUser();
            unsubEmail();
        };
    }, [user, authLoading]);

    const activeOrders = orders.filter(
        (o) => {
            const isCompleted = o.status === "COMPLETED";
            const isProcessing = o.status === "PAID" || o.status === "PROVISIONING";
            const isNotExpired = o.daysRemaining > 0;

            // Active if: (Completed AND Not Expired) OR Processing
            return (isCompleted && isNotExpired) || isProcessing;
        }
    );

    const historyOrders = orders.filter(
        (o) => {
            const isCompleted = o.status === "COMPLETED";
            const isExpired = o.daysRemaining <= 0;
            const isOther = o.status !== "COMPLETED" && o.status !== "PAID" && o.status !== "PROVISIONING";

            // History if: (Completed AND Expired) OR Failed/Cancelled/Pending
            return (isCompleted && isExpired) || isOther;
        }
    );

    const displayOrders = activeTab === "active" ? activeOrders : historyOrders;

    return (
        <div className="min-h-screen bg-background pb-24 md:pt-28">
            <div className="md:hidden">
                <MobileHeader title="Миний eSIM" />
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block container mx-auto px-6 mb-8 pt-8">
                <h1 className="text-3xl font-black text-slate-900">Миний eSIM</h1>
                <p className="text-slate-500 mt-2">Худалдаж авсан багцуудаа эндээс удирдаарай</p>
                {/* Temporary Debug Info */}
                <p className="text-xs text-slate-400 mt-1 font-mono">
                    User: {user?.email || "Not logged in"} | ID: {user?.uid}
                </p>
            </div>

            {/* Tabs */}
            <div className="container mx-auto px-4 md:px-6 mb-6">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={cn(
                            "flex-1 md:w-40 py-2.5 rounded-xl text-sm font-bold transition-all",
                            activeTab === "active"
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        Идэвхтэй ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={cn(
                            "flex-1 md:w-40 py-2.5 rounded-xl text-sm font-bold transition-all",
                            activeTab === "history"
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        Түүх ({historyOrders.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-6">
                {!user ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm mx-auto max-w-md">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <User className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Нэвтрэх шаардлагатай</h3>
                        <p className="text-slate-500 text-sm mb-8 px-8">
                            Та өөрийн захиалгуудыг харахын тулд системд нэвтэрч орно уу.
                        </p>
                        <Link href="/login">
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl shadow-lg">
                                Нэвтрэх
                            </Button>
                        </Link>
                    </div>
                ) : displayOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayOrders.map((order) => (
                            <EsimCard
                                key={order.id}
                                order={order}
                                onSelect={() => setSelectedOrder(order)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm mx-auto max-w-md">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Wifi className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {activeTab === "active"
                                ? "Идэвхтэй eSIM алга"
                                : "Түүх хоосон байна"}
                        </h3>
                        <p className="text-slate-500 text-sm mb-8 px-8">
                            {activeTab === "active"
                                ? "Дэлхийн хаана ч холбогдох боломжтой eSIM багцаа сонгоод аялалаа эхлүүлээрэй."
                                : "Таны худалдан авалтын түүх энд харагдах болно."}
                        </p>
                        <Link href="/packages">
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl shadow-lg shadow-red-600/20">
                                <Plus className="h-4 w-4 mr-2" />
                                Багц сонгох
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <EsimDetailModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
