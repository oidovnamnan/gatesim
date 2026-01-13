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
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getCountryFlag } from "@/lib/utils";
import { useTranslation } from "@/providers/language-provider";

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
    supportedCountries: { code: string; name: string }[];
    shortInfo: string;
    operatorInfo: string[];
}

interface PackageClientProps {
    pkg: PackageDetail;
}

export default function PackageClient({ pkg }: PackageClientProps) {
    const { t, language } = useTranslation();
    const router = useRouter();
    const [showDetails, setShowDetails] = useState(false);
    const [showCountries, setShowCountries] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic translation helpers
    const getTranslatedCountryName = (code: string, defaultName: string) => {
        const key = `country_${code.toUpperCase()}`;
        const translated = t(key);
        // If translation is the key itself, it means it's missing, use default or Intl
        if (translated === key) {
            try {
                const regionNames = new Intl.DisplayNames([language === 'mn' ? 'mn' : language], { type: 'region' });
                return regionNames.of(code.toUpperCase()) || defaultName;
            } catch (e) {
                return defaultName;
            }
        }
        return translated;
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
        <div className="min-h-screen pb-48 md:pb-8 bg-background">
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

            {/* Package Info Card */}
            <div className="px-4">
                <Card className="p-5 bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">{displayTitle}</h2>
                        <div className="text-right">
                            <p className="text-sm text-slate-400">{t("price")}</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatPrice(pkg.price, pkg.currency)}
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
            <div className="px-4 mt-4 mb-24">
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
                <div className="bg-white rounded-2xl p-4 shadow-xl shadow-blue-900/10 border border-slate-100 pointer-events-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-slate-400 font-medium ml-1">{t("totalAmount")}</p>
                        <p className="text-xl font-extrabold text-slate-900">
                            {formatPrice(pkg.price, pkg.currency)}
                        </p>
                    </div>
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-500/20"
                        onClick={handleBuy}
                        loading={isLoading}
                    >
                        {t("buyNow")}
                        <Zap className="h-4 w-4 ml-1 fill-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
