"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    ShoppingBag,
    Smartphone,
    Home,
    GraduationCap,
    MapPin,
    Plane,
    Hotel,
    Truck,
    DollarSign,
    Loader2,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Clock,
    FileCheck,
    Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Product categories
const productCategories = [
    { id: "shoes", icon: ShoppingBag, label: "Гутал/Хувцас", labelEn: "Shoes/Clothing", city: "Putian/Guangzhou" },
    { id: "electronics", icon: Smartphone, label: "Электроник", labelEn: "Electronics", city: "Shenzhen" },
    { id: "home", icon: Home, label: "Гэр ахуй", labelEn: "Home & Living", city: "Yiwu" },
    { id: "toys", icon: GraduationCap, label: "Тоглоом/Бусад", labelEn: "Toys/Others", city: "Yiwu" },
];

// Trip variants
const tripVariants = [
    { id: "quick", label: "⚡ Хурдан", labelEn: "⚡ Quick", days: "3-4", desc: "Нэг зах, шууд", descEn: "One market, direct" },
    { id: "standard", label: "🎯 Стандарт", labelEn: "🎯 Standard", days: "5-7", desc: "2-3 зах, харьцуулах", descEn: "2-3 markets, compare" },
    { id: "full", label: "💎 Бүрэн", labelEn: "💎 Complete", days: "10+", desc: "Олон зах, factory tour", descEn: "Multiple markets, factory tour" },
];

// China wholesale markets
const wholesaleMarkets = [
    { id: "yiwu", name: "Yiwu (义乌)", nameMn: "Иву", desc: "Дэлхийн хамгийн том бөөний зах", emoji: "🏬" },
    { id: "putian", name: "Putian (莆田)", nameMn: "Путиан", desc: "Гутлын төв", emoji: "👟" },
    { id: "shenzhen", name: "Shenzhen (深圳)", nameMn: "Шенжен", desc: "Электроникийн төв", emoji: "📱" },
    { id: "guangzhou", name: "Guangzhou (广州)", nameMn: "Гуанжоу", desc: "Хувцасны төв", emoji: "👔" },
];

interface BusinessItinerary {
    productCategory: string;
    tripVariant: string;
    duration: number;
    totalBudget: string;
    days: {
        day: number;
        title: string;
        activities: {
            time: string;
            activity: string;
            location: string;
            type: string;
            cost?: string;
            contact?: string;
        }[];
    }[];
    markets: {
        name: string;
        address: string;
        speciality: string;
        tips: string[];
    }[];
    customsGuide: string[];
    esimRecommendation: string;
}

interface AIBusinessPlannerProps {
    className?: string;
}

export function AIBusinessPlanner({ className }: AIBusinessPlannerProps) {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [productCategory, setProductCategory] = useState("shoes");
    const [tripVariant, setTripVariant] = useState("standard");
    const [budget, setBudget] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<BusinessItinerary | null>(null);
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);

    const generateItinerary = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/business-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productCategory,
                    tripVariant,
                    budget,
                    language,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setItinerary(data.itinerary);
                setExpandedDays([1]);
            }
        } catch (error) {
            console.error("Business trip generation error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDay = (day: number) => {
        setExpandedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Markets Overview */}
            <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    {isMongolian ? "Хятадын Бөөний Захууд" : "China Wholesale Markets"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {wholesaleMarkets.map((market) => (
                        <div key={market.id} className="p-3 rounded-xl bg-background/50">
                            <span className="text-2xl">{market.emoji}</span>
                            <p className="font-bold text-sm mt-1">{market.name}</p>
                            <p className="text-xs text-muted-foreground">{market.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Product Category */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Бүтээгдэхүүний төрөл" : "Product Category"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {productCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setProductCategory(cat.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all",
                                    productCategory === cat.id
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                {isMongolian ? cat.label : cat.labelEn}
                                <span className="text-xs opacity-70">{cat.city}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Trip Variant */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Аяллын хувилбар" : "Trip Variant"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {tripVariants.map((variant) => (
                        <button
                            key={variant.id}
                            onClick={() => setTripVariant(variant.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 p-4 rounded-2xl font-bold transition-all",
                                tripVariant === variant.id
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <span className="text-lg">{variant.label.split(" ")[0]}</span>
                            <span className="text-sm">{variant.days} {isMongolian ? "хоног" : "days"}</span>
                            <span className="text-xs opacity-70">{isMongolian ? variant.desc : variant.descEn}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Барааны төсөв (USD)" : "Product Budget (USD)"}
                </h3>
                <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={isMongolian ? "Жишээ: $5,000 - $10,000" : "Example: $5,000 - $10,000"}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm"
                />
            </div>

            {/* Generate Button */}
            <Button
                onClick={generateItinerary}
                disabled={isLoading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isMongolian ? "Бизнес аяллын төлөвлөгөө үүсгэх" : "Generate Business Trip Plan"}
            </Button>

            {/* Generated Itinerary */}
            <AnimatePresence>
                {itinerary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Summary */}
                        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        🇨🇳 {isMongolian ? "Хятад Бизнес Аялал" : "China Business Trip"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {itinerary.duration} {isMongolian ? "хоногийн төлөвлөгөө" : "day plan"}
                                    </p>
                                </div>
                                <Badge className="bg-orange-500 text-lg px-4 py-2">
                                    {itinerary.totalBudget}
                                </Badge>
                            </div>
                            <p className="text-sm p-3 rounded-xl bg-background/50">
                                📱 {itinerary.esimRecommendation}
                            </p>
                        </Card>

                        {/* Day-by-Day */}
                        {itinerary.days.map((day) => (
                            <Card key={day.day} className="overflow-hidden">
                                <button
                                    onClick={() => toggleDay(day.day)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                                            {day.day}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold">{day.title}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {day.activities.length} {isMongolian ? "үйл ажиллагаа" : "activities"}
                                            </p>
                                        </div>
                                    </div>
                                    {expandedDays.includes(day.day) ? (
                                        <ChevronUp className="w-5 h-5" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedDays.includes(day.day) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 pt-0 space-y-3">
                                                {day.activities.map((activity, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                                            <Clock className="w-4 h-4 text-orange-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {activity.time}
                                                                </Badge>
                                                                {activity.cost && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {activity.cost}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-medium mt-1">{activity.activity}</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {activity.location}
                                                            </p>
                                                            {activity.contact && (
                                                                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                                                                    <Phone className="w-3 h-3" />
                                                                    {activity.contact}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}

                        {/* Customs Guide */}
                        {itinerary.customsGuide && itinerary.customsGuide.length > 0 && (
                            <Card className="p-4">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <FileCheck className="w-5 h-5 text-orange-500" />
                                    {isMongolian ? "Гаалийн зааварчилгаа" : "Customs Guide"}
                                </h4>
                                <ul className="space-y-2">
                                    {itinerary.customsGuide.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-orange-500">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AIBusinessPlanner;
