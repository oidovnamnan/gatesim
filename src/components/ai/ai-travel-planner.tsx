"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Map,
    Calendar,
    DollarSign,
    Clock,
    MapPin,
    Utensils,
    Camera,
    ShoppingBag,
    Plane,
    Hotel,
    Loader2,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Popular destinations
const destinations = [
    { code: "JP", name: "Япон", nameEn: "Japan", flag: "🇯🇵" },
    { code: "KR", name: "Солонгос", nameEn: "Korea", flag: "🇰🇷" },
    { code: "TH", name: "Тайланд", nameEn: "Thailand", flag: "🇹🇭" },
    { code: "CN", name: "Хятад", nameEn: "China", flag: "🇨🇳" },
    { code: "SG", name: "Сингапур", nameEn: "Singapore", flag: "🇸🇬" },
    { code: "US", name: "Америк", nameEn: "USA", flag: "🇺🇸" },
];

// Trip purposes
const tripPurposes = [
    { id: "tourist", label: "Жуулчлал", labelEn: "Tourism", icon: Camera },
    { id: "shopping", label: "Шоппинг", labelEn: "Shopping", icon: ShoppingBag },
    { id: "business", label: "Бизнес", labelEn: "Business", icon: Map },
    { id: "medical", label: "Эмчилгээ", labelEn: "Medical", icon: MapPin },
];

// Budget levels
const budgetLevels = [
    { id: "budget", label: "Хэмнэлттэй", labelEn: "Budget", price: "$" },
    { id: "mid", label: "Дундаж", labelEn: "Mid-range", price: "$$" },
    { id: "luxury", label: "Люкс", labelEn: "Luxury", price: "$$$" },
];

interface ItineraryDay {
    day: number;
    title: string;
    activities: {
        time: string;
        activity: string;
        location: string;
        type: "food" | "attraction" | "transport" | "hotel" | "shopping";
        cost?: string;
    }[];
}

interface Itinerary {
    destination: string;
    duration: number;
    totalBudget: string;
    days: ItineraryDay[];
    tips: string[];
    esimRecommendation: string;
}

interface AITravelPlannerProps {
    className?: string;
}

export function AITravelPlanner({ className }: AITravelPlannerProps) {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [destination, setDestination] = useState("");
    const [duration, setDuration] = useState(7);
    const [purpose, setPurpose] = useState("tourist");
    const [budget, setBudget] = useState("mid");
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);

    const generateItinerary = async () => {
        if (!destination) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    duration,
                    purpose,
                    budget,
                    language: language,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setItinerary(data.itinerary);
                setExpandedDays([1]); // Expand first day by default
            }
        } catch (error) {
            console.error("Itinerary generation error:", error);
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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "food": return Utensils;
            case "attraction": return Camera;
            case "transport": return Plane;
            case "hotel": return Hotel;
            case "shopping": return ShoppingBag;
            default: return MapPin;
        }
    };

    return (
        <div className={cn("space-y-6", className)}>
            {/* Destination Selection */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Хаашаа явах вэ?" : "Where to?"}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {destinations.map((dest) => (
                        <button
                            key={dest.code}
                            onClick={() => setDestination(dest.code)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all",
                                destination === dest.code
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <span>{dest.flag}</span>
                            {isMongolian ? dest.name : dest.nameEn}
                        </button>
                    ))}
                </div>
            </div>

            {/* Duration */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Хэдэн хоног?" : "How many days?"}
                </h3>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min={3}
                        max={30}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <Badge variant="outline" className="px-4 py-2 text-lg font-bold">
                        {duration} {isMongolian ? "хоног" : "days"}
                    </Badge>
                </div>
            </div>

            {/* Purpose */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Аяллын зорилго" : "Trip purpose"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tripPurposes.map((p) => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setPurpose(p.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all",
                                    purpose === p.id
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                {isMongolian ? p.label : p.labelEn}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Budget */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Төсөв" : "Budget"}
                </h3>
                <div className="flex gap-2">
                    {budgetLevels.map((b) => (
                        <button
                            key={b.id}
                            onClick={() => setBudget(b.id)}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl font-bold transition-all",
                                budget === b.id
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            <span className="text-2xl">{b.price}</span>
                            <span className="text-xs">{isMongolian ? b.label : b.labelEn}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <Button
                onClick={generateItinerary}
                disabled={!destination || isLoading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isMongolian ? "Төлөвлөгөө үүсгэх" : "Generate Itinerary"}
            </Button>

            {/* Generated Itinerary */}
            <AnimatePresence>
                {itinerary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Summary Card */}
                        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">
                                        {destinations.find(d => d.code === itinerary.destination)?.flag}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {destinations.find(d => d.code === itinerary.destination)?.[isMongolian ? "name" : "nameEn"]}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {itinerary.duration} {isMongolian ? "хоногийн аялал" : "day trip"}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-500 text-lg px-4 py-2">
                                    {itinerary.totalBudget}
                                </Badge>
                            </div>
                            <p className="text-sm p-3 rounded-xl bg-background/50">
                                📱 {itinerary.esimRecommendation}
                            </p>
                        </Card>

                        {/* Day-by-Day Itinerary */}
                        {itinerary.days.map((day) => (
                            <Card key={day.day} className="overflow-hidden">
                                <button
                                    onClick={() => toggleDay(day.day)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
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
                                                {day.activities.map((activity, idx) => {
                                                    const Icon = getActivityIcon(activity.type);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                                <Icon className="w-4 h-4 text-emerald-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Clock className="w-3 h-3 mr-1" />
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
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}

                        {/* Tips */}
                        {itinerary.tips.length > 0 && (
                            <Card className="p-4">
                                <h4 className="font-bold mb-3">
                                    💡 {isMongolian ? "Зөвлөмжүүд" : "Tips"}
                                </h4>
                                <ul className="space-y-2">
                                    {itinerary.tips.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground">
                                            • {tip}
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

export default AITravelPlanner;
