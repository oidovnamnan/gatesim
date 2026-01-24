"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Wifi,
    Clock,
    Globe,
    Zap,
    Check,
    Info,
    ChevronDown,
    ChevronUp,
    Smartphone,
    ShieldCheck,
    AlertCircle,
    UserCircle,
    ArrowRight
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getCountryFlag, cn } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";
import { useAuth } from "@/providers/auth-provider";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useMemo } from "react";
import Link from "next/link";

interface PackageDetail {
    id: string;
    title: string;
    operatorTitle: string;
    data: string;
    validityDays: number;
    price: number;
    currency: string;
    countries: string[];
    countryName: string;
    isUnlimited: boolean;
    isFeatured: boolean;
    isTopUp: boolean;
    supportedCountries: { code: string; name: string }[];
    shortInfo: string;
    operatorInfo: string[];
}

interface PackageClientProps {
    pkg: PackageDetail;
}

export default function PackageClient({ pkg }: PackageClientProps) {
    const { t, language } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [showDetails, setShowDetails] = useState(false);
    const [showCountries, setShowCountries] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userOrders, setUserOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Fetch user orders to check for existing eSIMs
    useEffect(() => {
        if (authLoading || !user) {
            setOrdersLoading(false);
            return;
        }

        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("userId", "==", user.uid),
            where("status", "in", ["COMPLETED", "PAID", "PROVISIONING"])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserOrders(orders);
            setOrdersLoading(false);
        }, (err) => {
            console.error("Error fetching orders for safety check:", err);
            setOrdersLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    // Safety validation logic
    const { canBuy, reason } = useMemo(() => {
        if (!pkg.isTopUp) return { canBuy: true, reason: null };

        // 1. Must be logged in
        if (!user) return { canBuy: false, reason: "LOGIN_REQUIRED" };

        if (ordersLoading) return { canBuy: false, reason: "LOADING" };

        // 2. Must have at least one eSIM
        if (userOrders.length === 0) return { canBuy: false, reason: "NO_ESIM" };

        // 3. Must have a matching provider
        // MobiMatter uses provider names like "eSIMGo", "RedteaGO", "Sparks"
        // We check if any existing order item's operator matches
        const hasMatchingProvider = userOrders.some(order => {
            const items = order.items || [];
            return items.some((item: any) => {
                const operator = item.metadata?.operator || "";
                return operator.toLowerCase().includes(pkg.operatorTitle.toLowerCase()) ||
                    pkg.operatorTitle.toLowerCase().includes(operator.toLowerCase());
            });
        });

        if (!hasMatchingProvider) return { canBuy: false, reason: "PROVIDER_MISMATCH" };

        return { canBuy: true, reason: null };
    }, [pkg.isTopUp, user, userOrders, ordersLoading, pkg.operatorTitle]);

    // Dynamic translation helpers
    const getTranslatedCountryName = (code: string, defaultName: string) => {
        const key = `country_${code.toUpperCase()}`;
        const translated = t(key);
        return translated === key ? defaultName : translated;
    };

    const countryName = getTranslatedCountryName(pkg.countries[0], pkg.countryName);

    // Dynamic Title for regional packages
    let displayTitle = pkg.title;
    if (pkg.countries.length > 1) {
        displayTitle = `${countryName} ${t("plusCountries").replace("{count}", (pkg.countries.length - 1).toString())}`;
    }

    const flag = getCountryFlag(pkg.countries[0]);

    const handleBuy = async () => {
        setIsLoading(true);
        // Get current search params to persist country context
        const searchParams = new URLSearchParams(window.location.search);
        const country = searchParams.get("country");
        const checkoutUrl = `/checkout?package=${pkg.id}${country ? `&country=${country}` : ""}`;

        // Navigate to checkout
        router.push(checkoutUrl);
    };

    return (
        <div className="min-h-screen pb-36 md:pb-8 bg-background">
            <MobileHeader showBack title={countryName} />

            {/* Hero Section */}
            <div className="relative pt-16 pb-6">
                <div className="px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block relative"
                    >
                        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-6xl border border-slate-100 mb-4 mx-auto">
                            {flag}
                        </div>
                        {pkg.isFeatured && (
                            <div className="absolute -top-2 -right-2">
                                <Badge className="bg-blue-600 text-white shadow-lg border-2 border-white">✨ {t("featured")}</Badge>
                            </div>
                        )}
                    </motion.div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        {countryName} eSIM
                    </h1>
                    <p className="text-slate-500 font-medium">{pkg.operatorTitle}</p>
                </div>
            </div>

            {/* Top-up Warning */}
            {pkg.isTopUp && (
                <div className="px-4 mb-4">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-amber-100 p-2 rounded-xl mt-0.5">
                                <Zap className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-900 text-sm mb-1">
                                    {t("topUp")}: {t("importantNotes")}
                                </h3>
                                <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                                    {t("topUpDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VPN Info for China */}
            {pkg.countries.includes("CN") && (
                <div className="px-4 mt-6 mb-2">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-100 p-2 rounded-xl mt-0.5">
                                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-emerald-900 text-sm mb-1">
                                    {t("vpnFeatureTitle")}
                                </h3>
                                <p className="text-xs text-emerald-800/80 leading-relaxed font-medium">
                                    {t("vpnFeatureDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Package Info Card */}
            <div className="px-4">
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    {/* Compact header with title and price */}
                    <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-800 flex-1">{displayTitle}</h2>
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100">
                            <p className="text-lg font-bold whitespace-nowrap">
                                ₮{pkg.price.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Key specs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Wifi className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase">DATA</span>
                            </div>
                            <p className="font-bold text-slate-900 text-lg ml-1">
                                {pkg.isUnlimited ? "Unlimited" : pkg.data}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase">{t("validity")}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-lg ml-1">
                                {pkg.validityDays} {t("day")}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase">{t("coverage")}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-lg ml-1">
                                {t("countPackages").replace("{count}", pkg.countries.length.toString())}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase">{t("activation")}</span>
                            </div>
                            <p className="font-bold text-slate-900 text-lg ml-1">
                                {t("instant")}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Supported Countries (For Regional Packages) */}
            {pkg.supportedCountries && pkg.supportedCountries.length > 1 && (
                <div className="px-4 mt-4">
                    <Card className="p-5 bg-white border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-emerald-500" />
                                <p className="text-base font-bold text-slate-900">
                                    {t("allCountries")} ({pkg.supportedCountries.length})
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {pkg.supportedCountries.slice(0, showCountries ? undefined : 6).map((c) => (
                                <div key={c.code} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="text-lg leading-none">{getCountryFlag(c.code)}</span>
                                    <span className="text-xs font-bold text-slate-700 truncate">{getTranslatedCountryName(c.code, c.name)}</span>
                                </div>
                            ))}
                        </div>

                        {pkg.supportedCountries.length > 6 && (
                            <button
                                onClick={() => setShowCountries(!showCountries)}
                                className="w-full mt-3 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                {showCountries ? t("back") : `${t("aiSeeAll")} (+${pkg.supportedCountries.length - 6})`}
                            </button>
                        )}
                    </Card>
                </div>
            )}

            {/* Operator Info */}
            <div className="px-4 mt-4">
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="h-5 w-5 text-blue-500" />
                        <p className="text-base font-bold text-slate-900">{t("packageDetails")}</p>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium leading-relaxed">{t("speed4G5G")}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium leading-relaxed">{t("noSpeedLimit")}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium leading-relaxed">{t("hotspotSupport")}</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="mt-1 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                            </div>
                            <span className="text-sm text-slate-600 font-medium leading-relaxed">{t("activationOnUse")}</span>
                        </li>
                    </ul>
                </Card>
            </div>

            {/* Expandable Details */}
            <div className="px-4 mt-4">
                <Card className="overflow-hidden bg-white border-slate-200 shadow-sm">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <Smartphone className="h-4 w-4 text-slate-500 bg-transparent" />
                            </div>
                            <span className="text-sm font-bold text-slate-800">
                                {t("compatibleDevices")}
                            </span>
                        </div>
                        {showDetails ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                    </button>

                    {showDetails && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            className="border-t border-slate-100 p-4 bg-slate-50/50"
                        >
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">iPhone</p>
                                    <p className="text-xs text-slate-500">
                                        {t("compatibleIphone")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Samsung</p>
                                    <p className="text-xs text-slate-500">
                                        {t("compatibleSamsung")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Google Pixel</p>
                                    <p className="text-xs text-slate-500">
                                        {t("compatiblePixel")}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </div>

            {/* Important notes */}
            <div className="px-4 mt-4 mb-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">
                                {t("importantNotes")}
                            </p>
                            <p className="text-xs text-amber-700/80 leading-relaxed">{t("emailDeliveryInfo")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+70px)] md:pb-4 bg-gradient-to-t from-background via-background to-transparent z-30">
                <div className={cn(
                    "max-w-md mx-auto rounded-2xl p-4 shadow-xl border flex flex-col gap-3",
                    canBuy ? "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200" : "bg-white border-red-100"
                )}>
                    {reason === "LOGIN_REQUIRED" && (
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <UserCircle className="h-4 w-4" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">{t("loginRequired")}</p>
                        </div>
                    )}
                    {(reason === "NO_ESIM" || reason === "PROVIDER_MISMATCH") && (
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-[10px] font-bold uppercase tracking-wider">{t("incompatible")}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500 font-medium ml-1">{t("totalAmount")}</p>
                            <p className="text-xl font-extrabold text-slate-900">
                                {formatPrice(pkg.price, pkg.currency)}
                            </p>
                        </div>

                        {canBuy ? (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-500/30"
                                onClick={handleBuy}
                                loading={isLoading}
                                disabled={ordersLoading}
                            >
                                {t("buyNow")}
                                <Zap className="h-4 w-4 ml-1 fill-white" />
                            </Button>
                        ) : reason === "LOGIN_REQUIRED" ? (
                            <Link href="/profile" className="flex-1 max-w-[200px]">
                                <Button
                                    size="lg"
                                    fullWidth
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg"
                                >
                                    {t("login")}
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex-1 max-w-[240px]">
                                <p className="text-[10px] text-red-500 font-bold leading-tight text-right mb-1">
                                    {reason === "NO_ESIM" ? t("topUpNoEsimError") : t("topUpProviderError").replace("{provider}", pkg.operatorTitle)}
                                </p>
                                <Button
                                    size="lg"
                                    fullWidth
                                    disabled
                                    className="bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed border-none"
                                >
                                    {t("buyNow")}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
