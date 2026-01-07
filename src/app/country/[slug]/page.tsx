"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ChevronRight,
    Train,
    Bus,
    Car,
    Smartphone,
    AlertCircle,
    Globe,
    Clock,
    Banknote,
    MessageSquare,
    Wifi,
    Shield,
    MapPin,
    Phone,
} from "lucide-react";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIChat } from "@/components/ai/ai-chat";
import { cn } from "@/lib/utils";
import { countryInfoDatabase, CountryInfo, CountryTransport } from "@/data/country-info";

const transportIcons: Record<string, typeof Train> = {
    metro: Train,
    bus: Bus,
    train: Train,
    taxi: Car,
    app: Smartphone,
};

const categoryIcons: Record<string, string> = {
    safety: "🛡️",
    culture: "🎌",
    money: "💰",
    food: "🍜",
    language: "🗣️",
    connectivity: "📶",
};

// In real app, get from params
// const mockCountrySlug = "japan";

export default function CountryInfoPage({ params }: { params: { slug: string } }) {
    const [activeTab, setActiveTab] = useState<"overview" | "transport" | "tips" | "phrases">("overview");

    const country = countryInfoDatabase[params.slug] as CountryInfo;

    if (!country) {
        return <div>Улс олдсонгүй</div>;
    }

    const tabs = [
        { id: "overview", label: "Ерөнхий", icon: "🌏" },
        { id: "transport", label: "Тээвэр", icon: "🚇" },
        { id: "tips", label: "Зөвлөгөө", icon: "💡" },
        { id: "phrases", label: "Хэллэг", icon: "🗣️" },
    ];

    return (
        <div className="min-h-screen pb-24">
            <MobileHeader title={country.nameMn} showBack />

            {/* Hero */}
            <div className="relative px-4 py-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-violet-600/10" />
                <div className="relative flex items-center gap-4">
                    <div className="text-6xl">{country.flag}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{country.nameMn}</h1>
                        <p className="text-muted-foreground">{country.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="default" size="sm">
                                <MapPin className="h-3 w-3" />
                                {country.capital}
                            </Badge>
                            <Badge variant="default" size="sm">
                                <Clock className="h-3 w-3" />
                                {country.timezone}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick info cards */}
            <div className="px-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Валют</span>
                        </div>
                        <p className="font-semibold text-foreground">
                            {country.currencySymbol} {country.currency}
                        </p>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Хэл</span>
                        </div>
                        <p className="font-semibold text-foreground">{country.language}</p>
                    </Card>
                </div>
            </div>

            {/* Emergency numbers */}
            <div className="px-4 mb-6">
                <Card className="p-4 bg-red-500/10 border-red-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <h3 className="font-semibold text-foreground">Яаралтай дугаарууд</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <a href={`tel:${country.emergencyNumbers.police}`} className="text-center p-2 rounded-lg bg-muted/50">
                            <Phone className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                            <p className="text-xs text-muted-foreground">Цагдаа</p>
                            <p className="font-bold text-foreground">{country.emergencyNumbers.police}</p>
                        </a>
                        <a href={`tel:${country.emergencyNumbers.ambulance}`} className="text-center p-2 rounded-lg bg-muted/50">
                            <Phone className="h-4 w-4 mx-auto mb-1 text-red-400" />
                            <p className="text-xs text-muted-foreground">Түргэн</p>
                            <p className="font-bold text-foreground">{country.emergencyNumbers.ambulance}</p>
                        </a>
                        <a href={`tel:${country.emergencyNumbers.fire}`} className="text-center p-2 rounded-lg bg-muted/50">
                            <Phone className="h-4 w-4 mx-auto mb-1 text-orange-400" />
                            <p className="text-xs text-muted-foreground">Гал</p>
                            <p className="font-bold text-foreground">{country.emergencyNumbers.fire}</p>
                        </a>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "gradient-primary text-foreground"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="px-4">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* SIM Info */}
                        <Card className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Wifi className="h-5 w-5 text-emerald-400" />
                                <h3 className="font-semibold text-foreground">Интернет мэдээлэл</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Оператор</span>
                                    <span className="text-white text-sm">{country.simInfo.networks.join(", ")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Хамрах хүрээ</span>
                                    <span className="text-white text-sm">{country.simInfo.coverage}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground text-sm">Хурд</span>
                                    <span className="text-white text-sm">{country.simInfo.speed}</span>
                                </div>
                            </div>
                        </Card>

                        {/* eSIM CTA */}
                        <Link href="/packages">
                            <Card className="p-4 gradient-primary">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                                        <Smartphone className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">eSIM авах</h3>
                                        <p className="text-sm text-white/80">
                                            {country.nameMn}-д зориулсан багц үзэх
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-foreground" />
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                )}

                {/* Transport Tab */}
                {activeTab === "transport" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {country.transport.map((t: CountryTransport, index: number) => {
                            const Icon = transportIcons[t.type] || Train;
                            return (
                                <Card key={index} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-5 w-5 text-white/70" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-foreground">{t.name}</h4>
                                                {t.app && (
                                                    <Badge variant="secondary" size="sm">App</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                                            {t.priceRange && (
                                                <p className="text-sm text-emerald-400 mt-1">
                                                    {t.priceRange}
                                                </p>
                                            )}
                                            {t.tips && t.tips.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {t.tips.map((tip, i) => (
                                                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                                            <span>•</span> {tip}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            {t.app && t.appUrl && (
                                                <a
                                                    href={t.appUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block mt-2"
                                                >
                                                    <Button size="sm" variant="ghost">
                                                        {t.app} татах
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </motion.div>
                )}

                {/* Tips Tab */}
                {activeTab === "tips" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {country.tips.map((tip, index) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="text-2xl">{tip.icon || categoryIcons[tip.category]}</div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">{tip.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                )}

                {/* Phrases Tab */}
                {activeTab === "phrases" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <Card className="p-4 mb-4 bg-blue-500/10 border-blue-500/30">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-400" />
                                <p className="text-sm text-foreground">
                                    Эдгээр хэллэгийг аялалдаа ашиглаарай
                                </p>
                            </div>
                        </Card>

                        {country.phrases.map((phrase, index) => (
                            <Card key={index} className="p-4">
                                <p className="font-semibold text-white text-lg">{phrase.phrase}</p>
                                {phrase.pronunciation && (
                                    <p className="text-xs text-muted-foreground mt-1">{phrase.pronunciation}</p>
                                )}
                                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    {phrase.meaning}
                                </p>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* AI Chat */}
            <AIChat country={country.nameMn} />
        </div>
    );
}
