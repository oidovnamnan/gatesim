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
    User,
    Download
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCountryFlag, cn } from "@/lib/utils";
import { collection, query, where, orderBy, onSnapshot, documentId, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";
import { Order } from "@/types/db";
import { useTranslation } from "@/providers/language-provider";
import { useGuestOrderStore } from "@/store/guest-order-store";
import { Trash2, Square, CheckSquare } from "lucide-react";

// Helper to format date
const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + " " + new Date(timestamp).toLocaleTimeString();
};

type TabType = "active" | "history";

interface EsimCardProps {
    order: any;
    onSelect: () => void;
    isSelecting?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}

function EsimCard({ order, onSelect, isSelecting, isSelected, onToggleSelect }: EsimCardProps) {
    const { t } = useTranslation();
    const flag = getCountryFlag(order.countryCode);
    const isActive = order.status === "COMPLETED" && order.daysRemaining > 0;
    const isProcessing = order.status === "PAID" || order.status === "PROVISIONING";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div
                onClick={() => isSelecting ? onToggleSelect?.() : onSelect()}
                className={cn(
                    "bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden",
                    isSelected ? "border-red-500 bg-red-50/10 ring-1 ring-red-500/20 shadow-md" : "border-slate-100 hover:shadow-md hover:border-blue-200"
                )}
            >
                {isSelecting && (
                    <div className="absolute top-4 right-4 z-10">
                        {isSelected ? (
                            <div className="bg-red-500 rounded-full p-1 shadow-lg">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white/50" />
                        )}
                    </div>
                )}
                <div className="flex items-start gap-4">
                    <div className="text-4xl shadow-sm rounded-xl overflow-hidden bg-slate-50">{flag}</div>
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 truncate text-lg">
                                {t(`country_${order.countryCode}`)}
                            </h3>
                            {order.isTopUp && (
                                <Badge className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0">🔄 {t("topUp")}</Badge>
                            )}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                    isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        isProcessing ? "bg-blue-50 text-blue-600 border-blue-100" :
                                            "bg-slate-100 text-slate-500 border-slate-200"
                                )}
                            >
                                {isActive ? t("statusActive") : isProcessing ? t("statusPending") : t("statusCompleted")}
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
                                        <span>{t("dataUsage")}</span>
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
                                {t("daysRemaining").replace("{count}", order.daysRemaining.toString())}
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
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const flag = getCountryFlag(order.countryCode);

    // Toggle body class to hide bottom nav
    useEffect(() => {
        document.body.classList.add("modal-open");
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, []);

    // Helper to normalize QR code source
    const getQrSrc = (qrData: string | null) => {
        if (!qrData) return null;
        if (qrData.startsWith("http") || qrData.startsWith("data:")) return qrData;
        // Assume raw base64 if no prefix
        return `data:image/png;base64,${qrData}`;
    };

    const qrSrc = getQrSrc(order.qrImg);

    const handleCopy = () => {
        navigator.clipboard.writeText(order.activationCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        const localizedCountry = t(`country_${order.countryCode}`);
        const shareText = `🌍 GateSIM eSIM: ${localizedCountry}\n📦 ${t("packages")}: ${order.packageName}\n🔑 LPA: ${order.activationCode}\n🆔 ICCID: ${order.iccid}\n📖 ${t("installationGuide")}: https://gatesim.mn/my-esims?ai=install`;

        try {
            if (navigator.share && qrSrc) {
                let file: File | null = null;

                if (qrSrc.startsWith('data:')) {
                    // Handle Base64
                    try {
                        const base64Content = qrSrc.split(',')[1];
                        const mimeType = qrSrc.split(',')[0].split(':')[1].split(';')[0] || 'image/png';
                        const byteCharacters = atob(base64Content);
                        const byteArrays = [];

                        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                            const slice = byteCharacters.slice(offset, offset + 512);
                            const byteNumbers = new Array(slice.length);
                            for (let i = 0; i < slice.length; i++) {
                                byteNumbers[i] = slice.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            byteArrays.push(byteArray);
                        }

                        const blob = new Blob(byteArrays, { type: mimeType });
                        file = new File([blob], `GateSIM-${order.countryName}-QR.png`, { type: mimeType });
                    } catch (e) {
                        console.error("Failed to process base64 QR", e);
                    }
                } else if (qrSrc.startsWith('http')) {
                    // Handle URL (QuickChart)
                    try {
                        const response = await fetch(qrSrc);
                        const blob = await response.blob();
                        file = new File([blob], `GateSIM-${order.countryName}-QR.png`, { type: blob.type });
                    } catch (e) {
                        console.error("Failed to fetch QR for sharing", e);
                    }
                }

                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: `GateSIM - ${order.countryName} eSIM`,
                        text: shareText,
                        files: [file]
                    });
                    return;
                }
            }

            if (navigator.share) {
                await navigator.share({
                    title: `GateSIM - ${order.countryName} eSIM`,
                    text: shareText
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleDownload = () => {
        if (!qrSrc) return;
        const link = document.createElement("a");
        link.href = qrSrc;
        link.download = `GateSIM-${order.countryName}-${order.orderNumber}-QR.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4"
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
                    <h3 className="font-bold text-slate-900">{t("esimDetails")}</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-200">
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>

                <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                    {/* Country Info */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="text-5xl shadow-sm rounded-2xl bg-white border border-slate-100 p-1">{flag}</div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-1">{t(`country_${order.countryCode}`)}</h2>
                            <Badge variant="outline" className="text-slate-500 font-medium border-slate-200">
                                {order.packageName}
                            </Badge>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100 flex flex-col items-center text-center relative group">
                        <p className="text-slate-500 text-sm font-medium mb-4">
                            {t("qrScanInstructions")}
                        </p>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 relative overflow-hidden">
                            {qrSrc ? (
                                <>
                                    <img
                                        src={qrSrc}
                                        alt="eSIM QR Code"
                                        className="w-48 h-48 object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hidden md:flex">
                                        <Button
                                            size="sm"
                                            className="bg-white text-slate-900 hover:bg-slate-100 rounded-full"
                                            onClick={handleDownload}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            {t("download")}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg">
                                    <QrCode className="w-16 h-16 text-slate-300" />
                                </div>
                            )}
                        </div>

                        {qrSrc && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="mb-4 md:hidden border-blue-200 text-blue-600 hover:bg-blue-50 bg-white rounded-full px-6 font-bold"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {t("downloadQr")}
                            </Button>
                        )}

                        <p className="text-xs text-slate-400">
                            {t("qrOneTime")}
                        </p>
                    </div>

                    {/* Manual entry code */}
                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-900 uppercase mb-2 ml-1">{t("manualEntry")}</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                            <code className="flex-1 font-mono text-sm text-slate-700 truncate select-all">
                                {order.activationCode}
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
                        <p className="text-xs font-bold text-slate-900 uppercase mb-2 ml-1">{t("iccid")}</p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <code className="text-sm font-mono text-slate-600 tracking-wide">{order.iccid}</code>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 py-6 rounded-2xl font-bold" onClick={handleShare}>
                            <Share className="h-4 w-4 mr-2" />
                            {t("sendToFriend")}
                        </Button>
                        <Link href="?ai=install" className="block">
                            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 py-6 rounded-2xl font-bold">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t("installationGuide")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function MyEsimsPage() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("active");
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelecting, setIsSelecting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            // GUEST MODE: Check for recent orders in session store
            const recentOrderIds = useGuestOrderStore.getState().recentOrderIds;

            if (recentOrderIds.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch guest orders
            setLoading(true);
            const ordersRef = collection(db, "orders");
            // Firestore 'in' query supports up to 10 items. 
            // If user somehow has more, we slice the last 10.
            const idsToCheck = recentOrderIds.slice(-10);

            const guestQuery = query(ordersRef, where(documentId(), "in", idsToCheck));

            const unsubGuest = onSnapshot(guestQuery, (snapshot) => {
                const guestOrdersMap = new Map();
                snapshot.docs.forEach(doc => guestOrdersMap.set(doc.id, { id: doc.id, ...doc.data() }));

                // Reuse the same formatting logic (extracted ideally, but inline for now to minimize refactor risk)
                const allOrders = Array.from(guestOrdersMap.values());
                allOrders.sort((a: any, b: any) => b.createdAt - a.createdAt);

                const formattedOrders = allOrders.map((data: any) => {
                    const esim = data.esim || {};
                    const pkg = data.package || (data.items && data.items[0]) || {};
                    const metadata = pkg.metadata || {};
                    const status = (data.status || "pending").toUpperCase();
                    const countryName = pkg.countryName || (pkg.countries && pkg.countries[0]) || metadata.country || "Global";

                    const nameToCode: Record<string, string> = {
                        "China": "CN", "China Short Trip": "CN", "China Premium": "CN",
                        "South Korea": "KR", "Korea": "KR",
                        "Japan": "JP",
                        "Thailand": "TH",
                        "Singapore": "SG",
                        "Vietnam": "VN",
                        "Taiwan": "TW",
                        "Hong Kong": "HK",
                        "Macau": "MO",
                        "Mongolia": "MN",
                        "United States": "US", "USA": "US"
                    };

                    let countryCode = (pkg.countries && pkg.countries[0]) || "WO";

                    if (countryCode === "WO") {
                        if (nameToCode[countryName]) countryCode = nameToCode[countryName];
                        else if (countryName.includes("China")) countryCode = "CN";
                        else if (countryName.includes("Korea")) countryCode = "KR";
                        else if (countryName.includes("Japan")) countryCode = "JP";

                        if (countryCode === "WO") {
                            const title = (pkg.name || pkg.title || "").toString();
                            if (title.includes("China")) countryCode = "CN";
                            else if (title.includes("Korea")) countryCode = "KR";
                            else if (title.includes("Japan")) countryCode = "JP";
                            else if (title.includes("Thailand")) countryCode = "TH";
                            else if (title.includes("Singapore")) countryCode = "SG";
                            else if (title.includes("Vietnam")) countryCode = "VN";
                            else if (title.includes("Taiwan")) countryCode = "TW";
                            else if (title.includes("Hong Kong")) countryCode = "HK";
                            else if (title.includes("Macau")) countryCode = "MO";
                            else if (title.includes("Mongolia")) countryCode = "MN";
                            else if (title.includes("USA") || title.includes("United States")) countryCode = "US";
                            else if (title.includes("Europe")) countryCode = "EU";
                        }
                    }

                    const validityDays = parseInt(pkg.durationDays || metadata.validity || "30");
                    const created = new Date(data.createdAt || Date.now());
                    const expiresAt = new Date(created.getTime() + validityDays * 24 * 60 * 60 * 1000);
                    const now = new Date();
                    const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

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
                        dataUsed: 0,
                        validityDays: validityDays,
                        daysRemaining: daysRemaining,
                        price: data.totalAmount,
                        qrImg: esim.qrData || esim.qrUrl || null,
                        activationCode: esim.lpa || "Generating...",
                        iccid: esim.iccid || "Pending...",
                        createdAt: formatDate(data.createdAt),
                        isTopUp: pkg.isTopUp || false,
                        hidden: data.hidden || false,
                        raw: data
                    };
                });

                setOrders(formattedOrders.filter(o => !o.hidden));
                setLoading(false);
            }, (error) => {
                console.error("Error fetching guest orders:", error);
                setLoading(false);
            });

            return () => unsubGuest();
        }

        setLoading(true);
        const ordersRef = collection(db, "orders");

        let unsubUser = () => { };
        let unsubEmail = () => { };

        const userOrdersMap = new Map();
        const emailOrdersMap = new Map();

        const updateOrders = () => {
            const allOrders = [...userOrdersMap.values(), ...emailOrdersMap.values()];
            const uniqueOrdersMap = new Map();
            allOrders.forEach(o => uniqueOrdersMap.set(o.id, o));

            const uniqueOrders = Array.from(uniqueOrdersMap.values());
            uniqueOrders.sort((a: any, b: any) => b.createdAt - a.createdAt);

            const formattedOrders = uniqueOrders.map((data: any) => {
                const esim = data.esim || {};
                const pkg = data.package || (data.items && data.items[0]) || {};
                const metadata = pkg.metadata || {};
                const status = (data.status || "pending").toUpperCase();
                const countryName = pkg.countryName || (pkg.countries && pkg.countries[0]) || metadata.country || "Global";

                const nameToCode: Record<string, string> = {
                    "China": "CN", "China Short Trip": "CN", "China Premium": "CN",
                    "South Korea": "KR", "Korea": "KR",
                    "Japan": "JP",
                    "Thailand": "TH",
                    "Singapore": "SG",
                    "Vietnam": "VN",
                    "Taiwan": "TW",
                    "Hong Kong": "HK",
                    "Macau": "MO",
                    "Mongolia": "MN",
                    "United States": "US", "USA": "US"
                };

                let countryCode = (pkg.countries && pkg.countries[0]) || "WO";

                if (countryCode === "WO") {
                    if (nameToCode[countryName]) countryCode = nameToCode[countryName];
                    else if (countryName.includes("China")) countryCode = "CN";
                    else if (countryName.includes("Korea")) countryCode = "KR";
                    else if (countryName.includes("Japan")) countryCode = "JP";

                    if (countryCode === "WO") {
                        const title = (pkg.name || pkg.title || "").toString();
                        if (title.includes("China")) countryCode = "CN";
                        else if (title.includes("Korea")) countryCode = "KR";
                        else if (title.includes("Japan")) countryCode = "JP";
                        else if (title.includes("Thailand")) countryCode = "TH";
                        else if (title.includes("Singapore")) countryCode = "SG";
                        else if (title.includes("Vietnam")) countryCode = "VN";
                        else if (title.includes("Taiwan")) countryCode = "TW";
                        else if (title.includes("Hong Kong")) countryCode = "HK";
                        else if (title.includes("Macau")) countryCode = "MO";
                        else if (title.includes("Mongolia")) countryCode = "MN";
                        else if (title.includes("USA") || title.includes("United States")) countryCode = "US";
                        else if (title.includes("Europe")) countryCode = "EU";
                    }
                }

                const validityDays = parseInt(pkg.durationDays || metadata.validity || "30");
                const created = new Date(data.createdAt || Date.now());
                const expiresAt = new Date(created.getTime() + validityDays * 24 * 60 * 60 * 1000);
                const now = new Date();
                const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

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
                    dataUsed: 0,
                    validityDays: validityDays,
                    daysRemaining: daysRemaining,
                    price: data.totalAmount,
                    qrImg: esim.qrData || esim.qrUrl || null,
                    activationCode: esim.lpa || "Generating...",
                    iccid: esim.iccid || "Pending...",
                    createdAt: formatDate(data.createdAt),
                    isTopUp: pkg.isTopUp || false,
                    hidden: data.hidden || false,
                    raw: data
                };
            });

            setOrders(formattedOrders.filter(o => !o.hidden));
            setLoading(false);
        };

        const userQuery = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        unsubUser = onSnapshot(userQuery, (snapshot) => {
            userOrdersMap.clear();
            snapshot.docs.forEach(doc => userOrdersMap.set(doc.id, { id: doc.id, ...doc.data() }));
            updateOrders();
        }, (error) => {
            console.error("Error fetching user orders:", error);
            setLoading(false);
        });

        if (user.email) {
            const emailQuery = query(ordersRef, where("contactEmail", "==", user.email));
            unsubEmail = onSnapshot(emailQuery, (snapshot) => {
                emailOrdersMap.clear();
                snapshot.docs.forEach(doc => emailOrdersMap.set(doc.id, { id: doc.id, ...doc.data() }));
                updateOrders();
            }, (error) => {
                console.error("Error fetching email orders:", error);
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
            return (isCompleted && isNotExpired) || isProcessing;
        }
    );

    const historyOrders = orders.filter(
        (o) => {
            const isCompleted = o.status === "COMPLETED";
            const isExpired = o.daysRemaining <= 0;
            const isOther = o.status !== "COMPLETED" && o.status !== "PAID" && o.status !== "PROVISIONING";
            return (isCompleted && isExpired) || isOther;
        }
    );

    const displayOrders = activeTab === "active" ? activeOrders : historyOrders;

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const selectAll = () => {
        if (selectedIds.size === historyOrders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(historyOrders.map(o => o.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size} багцыг түүхээс устгах уу?`)) return;

        setIsDeleting(true);
        try {
            const batch = writeBatch(db);
            selectedIds.forEach(id => {
                const docRef = doc(db, "orders", id);
                batch.update(docRef, { hidden: true });
            });
            await batch.commit();
            setIsSelecting(false);
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Error deleting orders:", error);
            alert("Алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (activeTab === "active") {
            setIsSelecting(false);
            setSelectedIds(new Set());
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-background pb-24 md:pt-28">
            <div className="md:hidden">
                <MobileHeader title={t("myEsims")} />
            </div>

            <div className="hidden md:block container mx-auto px-6 mb-8 pt-8">
                <h1 className="text-3xl font-black text-slate-900">{t("myEsimsHeroTitle")}</h1>
                <p className="text-slate-500 mt-2">{t("myEsimsHeroDesc")}</p>
            </div>

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
                        {t("active")} ({activeOrders.length})
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
                        {t("history")} ({historyOrders.length})
                    </button>
                    {activeTab === "history" && historyOrders.length > 0 && (
                        <button
                            onClick={() => setIsSelecting(!isSelecting)}
                            className={cn(
                                "hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold ml-4 border transition-all",
                                isSelecting ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {isSelecting ? t("cancel") : t("select")}
                        </button>
                    )}
                </div>
                {activeTab === "history" && historyOrders.length > 0 && (
                    <div className="md:hidden mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSelecting(!isSelecting)}
                            className={cn(
                                "w-full rounded-xl font-bold h-11",
                                isSelecting ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-600 border-slate-200"
                            )}
                        >
                            {isSelecting ? t("cancel") : t("select")}
                        </Button>
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 md:px-6">
                {!user && displayOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm mx-auto max-w-md">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <User className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t("loginRequired")}</h3>
                        <p className="text-slate-500 text-sm mb-8 px-8">
                            {t("loginRequiredDesc")}
                        </p>
                        <Link href="/profile">
                            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 rounded-xl shadow-lg">
                                {t("login")}
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
                                isSelecting={isSelecting}
                                isSelected={selectedIds.has(order.id)}
                                onToggleSelect={() => toggleSelect(order.id)}
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
                                ? t("noActiveEsims")
                                : t("noHistory")}
                        </h3>
                        <p className="text-slate-500 text-sm mb-8 px-8">
                            {activeTab === "active"
                                ? t("noActiveEsimsDesc")
                                : t("noHistoryDesc")}
                        </p>
                        <Link href="/packages">
                            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl shadow-lg shadow-red-600/20">
                                <Plus className="h-4 w-4 mr-2" />
                                {t("selectPackage")}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Multi-selection bar */}
            <AnimatePresence>
                {isSelecting && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-4 right-4 z-[60] flex items-center justify-between bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-3xl shadow-2xl border border-white/20 max-w-2xl mx-auto"
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={selectAll}
                                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                            >
                                {selectedIds.size === historyOrders.length ? (
                                    <CheckSquare className="h-5 w-5" />
                                ) : (
                                    <Square className="h-5 w-5" />
                                )}
                                <span className="text-sm font-bold">{t("selectAll")}</span>
                            </button>
                            <span className="text-sm font-bold border-l border-white/20 pl-4">
                                {selectedIds.size} сонгосон
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                disabled={selectedIds.size === 0 || isDeleting}
                                onClick={handleDeleteSelected}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-4 h-10 border-none"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t("delete")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
