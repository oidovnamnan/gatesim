"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Stethoscope,
    Heart,
    Eye,
    Sparkles as SparklesIcon,
    Bone,
    MapPin,
    Plane,
    Hotel,
    DollarSign,
    Loader2,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Clock,
    Phone,
    FileText,
    Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// Treatment types
const treatmentTypes = [
    { id: "cosmetic", icon: SparklesIcon, label: "Гоо сайхан", labelEn: "Cosmetic Surgery", desc: "Нүүр, хамар, нүд" },
    { id: "dental", icon: Stethoscope, label: "Шүд", labelEn: "Dental", desc: "Implant, whitening" },
    { id: "orthopedic", icon: Bone, label: "Үе мөч", labelEn: "Orthopedic", desc: "Өвдөг, нуруу" },
    { id: "cardiac", icon: Heart, label: "Зүрх", labelEn: "Cardiac", desc: "Stent, хагалгаа" },
    { id: "vision", icon: Eye, label: "Нүд", labelEn: "Vision", desc: "LASIK, cataract" },
];

// Medical tourism destinations
const medicalDestinations = [
    { code: "KR", name: "Солонгос", nameEn: "South Korea", specialty: "Гоо сайхан, арьс", flag: "🇰🇷", priceLevel: "$$$" },
    { code: "TH", name: "Тайланд", nameEn: "Thailand", specialty: "Шүд, ерөнхий", flag: "🇹🇭", priceLevel: "$$" },
    { code: "TR", name: "Турк", nameEn: "Turkey", specialty: "Үс суулгах, шүд", flag: "🇹🇷", priceLevel: "$$" },
    { code: "IN", name: "Энэтхэг", nameEn: "India", specialty: "Зүрх, үе мөч", flag: "🇮🇳", priceLevel: "$" },
];

interface MedicalItinerary {
    treatment: string;
    destination: string;
    duration: number;
    totalCost: string;
    preTripChecklist: string[];
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
    recovery: {
        duration: string;
        tips: string[];
    };
    hospitalInfo: {
        name: string;
        address: string;
        speciality: string;
        accreditation: string;
        contact: string;
    };
    esimRecommendation: string;
}

interface AIMedicalPlannerProps {
    className?: string;
}

export function AIMedicalPlanner({ className }: AIMedicalPlannerProps) {
    const { language } = useTranslation();
    const isMongolian = language === "mn";

    const [treatment, setTreatment] = useState("cosmetic");
    const [destination, setDestination] = useState("KR");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [itinerary, setItinerary] = useState<MedicalItinerary | null>(null);
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);

    const generateItinerary = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/medical-trip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    treatment,
                    destination,
                    additionalInfo,
                    language,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setItinerary(data.itinerary);
                setExpandedDays([1]);
            }
        } catch (error) {
            console.error("Medical trip generation error:", error);
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
            {/* Destinations Overview */}
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-green-500" />
                    {isMongolian ? "Эмчилгээний Аялалын Улсууд" : "Medical Tourism Destinations"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {medicalDestinations.map((dest) => (
                        <button
                            key={dest.code}
                            onClick={() => setDestination(dest.code)}
                            className={cn(
                                "p-3 rounded-xl text-left transition-all",
                                destination === dest.code
                                    ? "bg-green-500 text-white"
                                    : "bg-background/50 hover:bg-muted"
                            )}
                        >
                            <span className="text-2xl">{dest.flag}</span>
                            <p className="font-bold text-sm mt-1">{isMongolian ? dest.name : dest.nameEn}</p>
                            <p className="text-xs opacity-70">{dest.specialty}</p>
                            <Badge variant={destination === dest.code ? "secondary" : "outline"} className="mt-1 text-xs">
                                {dest.priceLevel}
                            </Badge>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Treatment Type */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Эмчилгээний төрөл" : "Treatment Type"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {treatmentTypes.map((t) => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTreatment(t.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all",
                                    treatment === t.id
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                {isMongolian ? t.label : t.labelEn}
                                <span className="text-xs opacity-70">{t.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Additional Info */}
            <div>
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Нэмэлт мэдээлэл (заавал биш)" : "Additional Info (optional)"}
                </h3>
                <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder={isMongolian ? "Жишээ: Давхар зовлоны мэдээлэл, тусгай шаардлага..." : "Example: Double eyelid surgery, specific requirements..."}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm h-24 resize-none"
                />
            </div>

            {/* Generate Button */}
            <Button
                onClick={generateItinerary}
                disabled={isLoading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isMongolian ? "Эмчилгээний аяллын төлөвлөгөө үүсгэх" : "Generate Medical Trip Plan"}
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
                        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {medicalDestinations.find(d => d.code === itinerary.destination)?.flag}
                                        {isMongolian ? "Эмчилгээний Аялал" : "Medical Trip"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {itinerary.duration} {isMongolian ? "хоногийн төлөвлөгөө" : "day plan"}
                                    </p>
                                </div>
                                <Badge className="bg-green-500 text-lg px-4 py-2">
                                    {itinerary.totalCost}
                                </Badge>
                            </div>
                            <p className="text-sm p-3 rounded-xl bg-background/50">
                                📱 {itinerary.esimRecommendation}
                            </p>
                        </Card>

                        {/* Hospital Info */}
                        {itinerary.hospitalInfo && (
                            <Card className="p-4">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-green-500" />
                                    {isMongolian ? "Эмнэлгийн мэдээлэл" : "Hospital Information"}
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <p className="font-bold">{itinerary.hospitalInfo.name}</p>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {itinerary.hospitalInfo.address}
                                    </p>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {itinerary.hospitalInfo.contact}
                                    </p>
                                    <Badge variant="outline">{itinerary.hospitalInfo.accreditation}</Badge>
                                </div>
                            </Card>
                        )}

                        {/* Pre-Trip Checklist */}
                        {itinerary.preTripChecklist && itinerary.preTripChecklist.length > 0 && (
                            <Card className="p-4">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-green-500" />
                                    {isMongolian ? "Урьдчилсан бэлтгэл" : "Pre-Trip Checklist"}
                                </h4>
                                <ul className="space-y-2">
                                    {itinerary.preTripChecklist.map((item, idx) => (
                                        <li key={idx} className="text-sm flex items-start gap-2">
                                            <span className="text-green-500">✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Day-by-Day */}
                        {itinerary.days.map((day) => (
                            <Card key={day.day} className="overflow-hidden">
                                <button
                                    onClick={() => toggleDay(day.day)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
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
                                                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                            <Clock className="w-4 h-4 text-green-600" />
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
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}

                        {/* Recovery Info */}
                        {itinerary.recovery && (
                            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    {isMongolian ? "Нөхөн сэргэлт" : "Recovery"}: {itinerary.recovery.duration}
                                </h4>
                                <ul className="space-y-2">
                                    {itinerary.recovery.tips.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
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

export default AIMedicalPlanner;
