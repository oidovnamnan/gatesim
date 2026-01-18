"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Map,
    Calendar as CalendarIcon,
    DollarSign,
    Clock,
    MapPin,
    Utensils,
    Camera,
    Plane,
    TrainFront,
    Bus,
    Car,
    ShoppingBag,
    Hotel,
    Loader2,
    ChevronDown,
    ChevronUp,
    Sparkles,
    Save,
    Check,
    Backpack,
    Edit,
    X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { createTrip } from "@/lib/db";
import dynamic from "next/dynamic";

const ItineraryMap = dynamic(() => import("./itinerary-map"), { ssr: false });

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
        coordinates?: { lat: number; lng: number };
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
    packingList: {
        category: string;
        items: string[];
    }[];
    budgetBreakdown?: {
        category: string;
        amount: number;
        currency: string;
        percentage: number;
    }[];
}

interface AITravelPlannerProps {
    className?: string;
}

export function AITravelPlanner({ className }: AITravelPlannerProps) {
    const { data: session } = useSession();
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [destination, setDestination] = useState("");
    const [duration, setDuration] = useState(7);
    const [purpose, setPurpose] = useState("tourist");
    const [budget, setBudget] = useState("mid");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);

    const handleActivityChange = (dayIndex: number, activityIndex: number, field: string, value: string) => {
        if (!itinerary) return;
        const newItinerary = { ...itinerary };
        // @ts-ignore
        newItinerary.days[dayIndex].activities[activityIndex][field] = value;
        setItinerary(newItinerary);
    };

    const [isCustomDestination, setIsCustomDestination] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [city, setCity] = useState("");
    const [transportMode, setTransportMode] = useState<"flight" | "train" | "bus" | "car" | "">("");

    const generateItinerary = async () => {
        if (!destination) return;

        setIsLoading(true);
        setIsSaved(false); // Reset saved status
        try {
            const res = await fetch("/api/ai/itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination: isCustomDestination ? destination : (destinations.find(d => d.code === destination)?.nameEn || destination),
                    duration,
                    purpose,
                    budget,
                    language: language,
                    city,
                    transportMode,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setItinerary(data.itinerary);
                setExpandedDays([1]); // Expand first day by default

                // Save to session storage for AI Chat context
                sessionStorage.setItem("gateSIM_activePlan", JSON.stringify({
                    type: "tourist",
                    destination: isCustomDestination ? destination : (destinations.find(d => d.code === destination)?.nameEn || destination),
                    data: data.itinerary
                }));
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

    const handleSave = async () => {
        if (!itinerary || !session?.user) return;
        setIsSaving(true);
        try {
            await createTrip({
                // @ts-ignore
                userId: (session?.user as any).id || session?.user?.email,
                destination: isCustomDestination ? destination : (destinations.find(d => d.code === destination)?.nameEn || destination),
                duration,
                purpose,
                budget,
                itinerary
            });
            setIsSaved(true);
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={cn("space-y-6 pb-32", className)}>
            {/* Destination Selection */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Хаашаа явах вэ?" : "Where to?"}
                </h3>
                <Select
                    value={isCustomDestination ? "custom" : (destinations.some(d => d.code === destination) ? destination : "")}
                    onValueChange={(val) => {
                        if (val === "custom") {
                            setDestination("");
                            setIsCustomDestination(true);
                        } else {
                            setDestination(val);
                            setIsCustomDestination(false);
                        }
                    }}
                >
                    <SelectTrigger className="w-full h-12 rounded-xl text-base bg-white border-slate-200">
                        <SelectValue placeholder={isMongolian ? "Улс сонгох" : "Select destination"} />
                    </SelectTrigger>
                    <SelectContent>
                        {destinations.map((dest) => (
                            <SelectItem key={dest.code} value={dest.code}>
                                <span className="mr-2">{dest.flag}</span>
                                {isMongolian ? dest.name : dest.nameEn}
                            </SelectItem>
                        ))}
                        <SelectItem value="custom">
                            <span className="mr-2">🌍</span>
                            {isMongolian ? "Бусад" : "Other"}
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Custom Destination Input */}
                <AnimatePresence>
                    {isCustomDestination && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder={isMongolian ? "Улс эсвэл хотын нэр бичнэ үү..." : "Enter country or city name..."}
                                className="w-full mt-3 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                autoFocus
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* City Selection */}
            <div>
                <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {isMongolian ? "Хот (Сонголттой)" : "City (Optional)"}
                </h3>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={isMongolian ? "Хот эсвэл бүс нутаг..." : "Enter city or region..."}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
            </div>

            {/* Start Date Selection */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Эхлэх огноо" : "Start Date"}
                </h3>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full h-12 justify-start text-left font-normal rounded-xl border-slate-200 bg-white",
                                !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : (isMongolian ? "Огноо сонгох" : "Pick a date")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Transport Mode Selection */}
            <div>
                <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                    <Plane className="w-4 h-4 text-slate-400" />
                    {isMongolian ? "Тээврийн хэрэгсэл" : "Transport Mode"}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { id: 'flight', icon: Plane, label: isMongolian ? 'Нисэх' : 'Flight' },
                        { id: 'train', icon: TrainFront, label: isMongolian ? 'Галт тэрэг' : 'Train' },
                        { id: 'bus', icon: Bus, label: isMongolian ? 'Автобус' : 'Bus' },
                        { id: 'car', icon: Car, label: isMongolian ? 'Машин' : 'Car' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setTransportMode(mode.id as any)}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                transportMode === mode.id
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            )}
                        >
                            <mode.icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
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
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
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
                                        {destinations.find(d => d.code === itinerary.destination)?.flag || "🌍"}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {destinations.find(d => d.code === itinerary.destination)?.[isMongolian ? "name" : "nameEn"] || itinerary.destination}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {itinerary.duration} {isMongolian ? "хоногийн аялал" : "day trip"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className="bg-emerald-500 text-lg px-4 py-2">
                                        {itinerary.totalBudget}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 h-8 bg-white/50 hover:bg-white"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                                            <span className="text-xs font-bold">
                                                {isEditing ? (isMongolian ? "Болих" : "Stop") : (isMongolian ? "Засах" : "Edit")}
                                            </span>
                                        </Button>

                                        {session?.user && (
                                            <Button
                                                size="sm"
                                                variant={isSaved ? "outline" : "default"}
                                                className={cn(
                                                    "gap-2 h-8",
                                                    isSaved
                                                        ? "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                )}
                                                onClick={handleSave}
                                                disabled={isSaved || isSaving}
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : isSaved ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Save className="w-3.5 h-3.5" />
                                                )}
                                                <span className="text-xs font-bold">
                                                    {isSaved
                                                        ? (isMongolian ? "Хадгалагдсан" : "Saved")
                                                        : (isMongolian ? "Хадгалах" : "Save Plan")}
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm p-3 rounded-xl bg-background/50">
                                📱 {itinerary.esimRecommendation}
                            </p>
                        </Card>

                        {/* Budget Dashboard */}
                        {itinerary.budgetBreakdown && itinerary.budgetBreakdown.length > 0 && (
                            <Card className="p-4 bg-white border-slate-200">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                    {isMongolian ? "Төсвийн задаргаа" : "Budget Breakdown"}
                                </h4>
                                <div className="space-y-4">
                                    {itinerary.budgetBreakdown.map((item, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-slate-700">{item.category}</span>
                                                <span className="text-emerald-700">{item.currency} {item.amount} ({item.percentage}%)</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Map */}
                        {itinerary.days.some(d => d.activities.some(a => a.coordinates)) && (
                            <div className="mb-4 space-y-2">
                                <h4 className="font-bold flex items-center gap-2 text-slate-800 px-1">
                                    <Map className="w-5 h-5 text-emerald-600" />
                                    {isMongolian ? "Аяллын зураг" : "Interactive Map"}
                                </h4>
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
                        )}

                        {/* Day-by-Day Itinerary */}
                        {itinerary.days.map((day, dayIndex) => (
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
                                                                    {isEditing ? (
                                                                        <div className="flex gap-2 w-full mb-2">
                                                                            <Input
                                                                                value={activity.time}
                                                                                onChange={(e) => handleActivityChange(dayIndex, idx, 'time', e.target.value)}
                                                                                className="w-20 h-7 text-xs bg-white"
                                                                            />
                                                                            <Input
                                                                                value={activity.cost || ""}
                                                                                onChange={(e) => handleActivityChange(dayIndex, idx, 'cost', e.target.value)}
                                                                                className="w-20 h-7 text-xs bg-white"
                                                                                placeholder="$Cost"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                                    {activity.time}
                                                                                </Badge>
                                                                                {activity.type === 'hotel' && (
                                                                                    <Button
                                                                                        size="sm"
                                                                                        variant="outline"
                                                                                        className="h-6 text-[10px] px-2 ml-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                                                                                        onClick={() => {
                                                                                            const checkIn = startDate ? addDays(startDate, dayIndex) : new Date();
                                                                                            const checkOut = addDays(checkIn, 1);
                                                                                            window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(activity.location)}&checkin=${format(checkIn, 'yyyy-MM-dd')}&checkout=${format(checkOut, 'yyyy-MM-dd')}&group_adults=2`, '_blank');
                                                                                        }}
                                                                                    >
                                                                                        {isMongolian ? "Үнэ шалгах" : "Check Rates"}
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                            {activity.cost && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {activity.cost}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {isEditing ? (
                                                                    <Textarea
                                                                        value={activity.activity}
                                                                        onChange={(e) => handleActivityChange(dayIndex, idx, 'activity', e.target.value)}
                                                                        className="min-h-[60px] text-sm mt-1 bg-white"
                                                                    />
                                                                ) : (
                                                                    <p className="font-medium mt-1">{activity.activity}</p>
                                                                )}

                                                                {isEditing ? (
                                                                    <Input
                                                                        value={activity.location}
                                                                        onChange={(e) => handleActivityChange(dayIndex, idx, 'location', e.target.value)}
                                                                        className="h-7 text-xs mt-1 bg-white"
                                                                    />
                                                                ) : (
                                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {activity.location}
                                                                    </p>
                                                                )}
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

                        {/* Packing List */}
                        {itinerary.packingList && itinerary.packingList.length > 0 && (
                            <Card className="p-4 bg-slate-50 border-slate-200">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
                                    <Backpack className="w-5 h-5 text-emerald-600" />
                                    {isMongolian ? "Ачаа тээшний жагсаалт" : "Smart Packing List"}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {itinerary.packingList.map((category, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                            <h5 className="font-bold text-sm text-emerald-700 mb-2">{category.category}</h5>
                                            <ul className="space-y-1.5">
                                                {category.items.map((item, i) => (
                                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

export default AITravelPlanner;
