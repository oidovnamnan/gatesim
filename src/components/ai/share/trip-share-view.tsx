"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Map,
    DollarSign,
    Clock,
    MapPin,
    Utensils,
    Camera,
    Plane,
    Hotel,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Download,
    Share2,
    Calendar as CalendarIcon,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamic import for the Map to avoid SSR issues
const ItineraryMap = dynamic(() => import("../itinerary-map"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center">Loading Map...</div>
});

interface Activity {
    time: string;
    activity: string;
    location: string;
    type: string;
    coordinates?: { lat: number; lng: number };
}

interface Day {
    day: number;
    title: string;
    activities: Activity[];
}

interface Itinerary {
    destination: string;
    duration: number;
    totalBudget: string;
    days: Day[];
    budgetBreakdown?: Array<{
        category: string;
        amount: string;
        currency: string;
        percentage: number;
    }>;
    esimRecommendation?: string;
}

interface TripShareViewProps {
    trip: {
        destination: string;
        duration: number;
        purpose: string;
        budget: string;
        itinerary: Itinerary;
    };
    isMongolian: boolean;
}

const destinations = [
    { code: "JP", name: "Япон", nameEn: "Japan", flag: "🇯🇵" },
    { code: "KR", name: "Өмнөд Солонгос", nameEn: "South Korea", flag: "🇰🇷" },
    { code: "TH", name: "Тайланд", nameEn: "Thailand", flag: "🇹🇭" },
    { code: "US", name: "Америк", nameEn: "USA", flag: "🇺🇸" },
    { code: "CN", name: "Хятад", nameEn: "China", flag: "🇨🇳" },
    { code: "SG", name: "Сингапур", nameEn: "Singapore", flag: "🇸🇬" },
];

export function TripShareView({ trip, isMongolian }: TripShareViewProps) {
    const { itinerary } = trip;
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);

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

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: isMongolian ? "Миний аяллын төлөвлөгөө" : "My Travel Plan",
                text: `${trip.destination} - ${trip.duration} ${isMongolian ? 'хоногийн аялал' : 'day trip'}`,
                url: window.location.href,
            }).catch(console.error);
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert(isMongolian ? "Холбоос хуулагдлаа!" : "Link copied to clipboard!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
            {/* Header / Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl print:shadow-none print:m-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                            {destinations.find(d => d.nameEn === trip.destination || d.name === trip.destination)?.flag || "🌍"}
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">
                                {trip.destination}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-white/80 font-medium">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{trip.duration} {isMongolian ? "хоногийн аялал" : "day trip"}</span>
                                <span className="opacity-50">•</span>
                                <span>{trip.purpose}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-center">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-1">
                                {isMongolian ? "Төсөв" : "Estimated Budget"}
                            </p>
                            <span className="text-2xl font-black">{itinerary.totalBudget}</span>
                        </div>
                        <div className="flex gap-2 print:hidden">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl h-10 px-4"
                                onClick={handleShare}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                {isMongolian ? "Хуваалцах" : "Share"}
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl h-10 px-4"
                                onClick={handlePrint}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {isMongolian ? "Татах" : "Download"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar: Budget & Map */}
                <div className="lg:col-span-1 space-y-6">
                    {/* eSIM Card */}
                    {itinerary.esimRecommendation && (
                        <Card className="p-4 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-500/20">
                            <h4 className="font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-100 mb-2">
                                <Plane className="w-4 h-4" />
                                {isMongolian ? "Дата тохиргоо" : "Connectivity"}
                            </h4>
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                                {itinerary.esimRecommendation}
                            </p>
                        </Card>
                    )}

                    {/* Budget Dashboard */}
                    {itinerary.budgetBreakdown && itinerary.budgetBreakdown.length > 0 && (
                        <Card className="p-5 bg-white shadow-sm border-slate-100">
                            <h4 className="font-bold mb-5 flex items-center gap-2 text-slate-800">
                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                {isMongolian ? "Төсвийн задаргаа" : "Budget Details"}
                            </h4>
                            <div className="space-y-4">
                                {itinerary.budgetBreakdown.map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                            <span className="text-slate-500">{item.category}</span>
                                            <span className="text-slate-900">{item.currency} {item.amount}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Miniature Map */}
                    <div className="space-y-3 print:hidden">
                        <h4 className="font-bold flex items-center gap-2 text-slate-800 px-1">
                            <Map className="w-5 h-5 text-emerald-600" />
                            {isMongolian ? "Аяллын зураг" : "Map View"}
                        </h4>
                        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white p-2">
                            <ItineraryMap
                                activities={itinerary.days.flatMap(day =>
                                    day.activities.map(act => ({
                                        day: day.day,
                                        title: act.activity,
                                        location: act.location,
                                        coordinates: act.coordinates
                                    }))
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Content: Itinerary */}
                <div className="lg:col-span-2 space-y-4">
                    {itinerary.days.map((day) => (
                        <Card key={day.day} className="overflow-hidden border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <button
                                onClick={() => toggleDay(day.day)}
                                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xl">
                                        {day.day}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900">{day.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                            {day.activities.length} {isMongolian ? "үйл ажиллагаа" : "planned activities"}
                                        </p>
                                    </div>
                                </div>
                                <div className="print:hidden">
                                    {expandedDays.includes(day.day) ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </button>

                            <AnimatePresence>
                                {(expandedDays.includes(day.day) || typeof window === 'undefined') && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 pt-0 space-y-4 relative">
                                            {/* Timeline line */}
                                            <div className="absolute left-[33px] top-0 bottom-8 w-[2px] bg-slate-100" />

                                            {day.activities.map((activity, idx) => {
                                                const Icon = getActivityIcon(activity.type);
                                                return (
                                                    <div key={idx} className="flex gap-4 relative">
                                                        <div className="mt-1 w-7 h-7 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center z-10">
                                                            <Icon className="w-3.5 h-3.5 text-slate-600" />
                                                        </div>
                                                        <div className="flex-1 pb-4 border-b border-slate-50 last:border-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-black font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                                                                    {activity.time}
                                                                </span>
                                                                <h5 className="font-bold text-slate-900 text-sm">{activity.activity}</h5>
                                                                {activity.type === 'hotel' && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-6 text-[10px] px-2 ml-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 print:hidden"
                                                                        onClick={() => {
                                                                            const checkIn = new Date(); // Fallback to today
                                                                            const checkOut = addDays(checkIn, 1);
                                                                            window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(activity.location)}&checkin=${format(checkIn, 'yyyy-MM-dd')}&checkout=${format(checkOut, 'yyyy-MM-dd')}&group_adults=2`, '_blank');
                                                                        }}
                                                                    >
                                                                        {isMongolian ? "Үнэ шалгах" : "Check Rates"}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
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
                </div>
            </div>

            {/* Footer / Call to Action */}
            <div className="pt-8 text-center space-y-4 print:hidden">
                <div className="w-16 h-1 w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <p className="text-slate-400 text-sm font-medium">
                    {isMongolian ? "Өөрийн аяллыг GateSIM ашиглан төлөвлөөрэй" : "Plan your own adventure with GateSIM AI"}
                </p>
                <Button
                    onClick={() => window.location.href = '/ai'}
                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-8 h-12 font-bold"
                >
                    {isMongolian ? "Аялал төлөвлөж эхлэх" : "Start Planning Now"}
                </Button>
            </div>
        </div>
    );
}
