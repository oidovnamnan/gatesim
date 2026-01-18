"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    Share2,
    Download,
    Upload,
    Backpack,
    Edit,
    X,
    Smartphone,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Search,
    Stethoscope,
    GraduationCap,
    Plus,
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
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const ItineraryMap = dynamic(() => import("./itinerary-map"), {
    ssr: false,
    loading: () => (
        <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
        </div>
    )
});

// --- Constants (Reused from V1) ---

const destinations = [
    { code: "JP", name: "Япон", nameEn: "Japan", flag: "🇯🇵" },
    { code: "KR", name: "Солонгос", nameEn: "Korea", flag: "🇰🇷" },
    { code: "TH", name: "Тайланд", nameEn: "Thailand", flag: "🇹🇭" },
    { code: "CN", name: "Хятад", nameEn: "China", flag: "🇨🇳" },
    { code: "SG", name: "Сингапур", nameEn: "Singapore", flag: "🇸🇬" },
    { code: "US", name: "Америк", nameEn: "USA", flag: "🇺🇸" },
    { code: "VN", name: "Вьетнам", nameEn: "Vietnam", flag: "🇻🇳" },
    { code: "MY", name: "Малайз", nameEn: "Malaysia", flag: "🇲🇾" },
    { code: "ID", name: "Индонез", nameEn: "Indonesia", flag: "🇮🇩" },
    { code: "PH", name: "Филиппин", nameEn: "Philippines", flag: "🇵🇭" },
    { code: "TW", name: "Тайвань", nameEn: "Taiwan", flag: "🇹🇼" },
    { code: "HK", name: "Хонконг", nameEn: "Hong Kong", flag: "🇭🇰" },
    { code: "AE", name: "Арабын Нэгдсэн Эмират", nameEn: "UAE", flag: "🇦🇪" },
    { code: "TR", name: "Турк", nameEn: "Turkey", flag: "🇹🇷" },
    { code: "IN", name: "Энэтхэг", nameEn: "India", flag: "🇮🇳" },
    { code: "AU", name: "Австрали", nameEn: "Australia", flag: "🇦🇺" },
    { code: "GB", name: "Их Британи", nameEn: "United Kingdom", flag: "🇬🇧" },
    { code: "FR", name: "Франц", nameEn: "France", flag: "🇫🇷" },
    { code: "DE", name: "Герман", nameEn: "Germany", flag: "🇩🇪" },
    { code: "IT", name: "Итали", nameEn: "Italy", flag: "🇮🇹" },
    { code: "ES", name: "Испани", nameEn: "Spain", flag: "🇪🇸" },
    { code: "RU", name: "Орос", nameEn: "Russia", flag: "🇷🇺" },
    { code: "CA", name: "Канад", nameEn: "Canada", flag: "🇨🇦" },
    { code: "NZ", name: "Шинэ Зеланд", nameEn: "New Zealand", flag: "🇳🇿" },
    { code: "KH", name: "Камбож", nameEn: "Cambodia", flag: "🇰🇭" },
    { code: "LA", name: "Лаос", nameEn: "Laos", flag: "🇱🇦" },
    { code: "MM", name: "Мьянмар", nameEn: "Myanmar", flag: "🇲🇲" },
    { code: "NP", name: "Балба", nameEn: "Nepal", flag: "🇳🇵" },
    { code: "LK", name: "Шри Ланка", nameEn: "Sri Lanka", flag: "🇱🇰" },
    { code: "MV", name: "Мальдив", nameEn: "Maldives", flag: "🇲🇻" },
    { code: "EG", name: "Египет", nameEn: "Egypt", flag: "🇪🇬" },
    { code: "GR", name: "Грек", nameEn: "Greece", flag: "🇬🇷" },
    { code: "PT", name: "Португал", nameEn: "Portugal", flag: "🇵🇹" },
    { code: "NL", name: "Нидерланд", nameEn: "Netherlands", flag: "🇳🇱" },
    { code: "CH", name: "Швейцарь", nameEn: "Switzerland", flag: "🇨🇭" },
    { code: "AT", name: "Австри", nameEn: "Austria", flag: "🇦🇹" },
    { code: "CZ", name: "Чех", nameEn: "Czech Republic", flag: "🇨🇿" },
    { code: "HU", name: "Унгар", nameEn: "Hungary", flag: "🇭🇺" },
    { code: "PL", name: "Польш", nameEn: "Poland", flag: "🇵🇱" },
    { code: "SE", name: "Швед", nameEn: "Sweden", flag: "🇸🇪" },
    { code: "FI", name: "Финлянд", nameEn: "Finland", flag: "🇫🇮" },
    { code: "NO", name: "Норвеги", nameEn: "Norway", flag: "🇳🇴" },
    { code: "DK", name: "Дани", nameEn: "Denmark", flag: "🇩🇰" },
    { code: "IE", name: "Ирланд", nameEn: "Ireland", flag: "🇮🇪" },
    { code: "BE", name: "Бельги", nameEn: "Belgium", flag: "🇧🇪" },
    { code: "MX", name: "Мексик", nameEn: "Mexico", flag: "🇲🇽" },
    { code: "BR", name: "Бразил", nameEn: "Brazil", flag: "🇧🇷" },
    { code: "AR", name: "Аргентин", nameEn: "Argentina", flag: "🇦🇷" },
    { code: "ZA", name: "Өмнөд Африк", nameEn: "South Africa", flag: "🇿🇦" },
    { code: "MA", name: "Морокко", nameEn: "Morocco", flag: "🇲🇦" },
    { code: "IL", name: "Израйль", nameEn: "Israel", flag: "🇮🇱" },
    { code: "JO", name: "Йордан", nameEn: "Jordan", flag: "🇯🇴" },
    { code: "SA", name: "Саудын Араб", nameEn: "Saudi Arabia", flag: "🇸🇦" },
    { code: "QA", name: "Катар", nameEn: "Qatar", flag: "🇶🇦" },
];

const CITY_SUGGESTIONS: Record<string, { name: string, nameEn: string }[]> = {
    "JP": [
        { name: "Токё", nameEn: "Tokyo" },
        { name: "Осака", nameEn: "Osaka" },
        { name: "Киото", nameEn: "Kyoto" },
        { name: "Саппоро", nameEn: "Sapporo" },
        { name: "Фүкүока", nameEn: "Fukuoka" },
        { name: "Окинава", nameEn: "Okinawa" },
        { name: "Нагоя", nameEn: "Nagoya" },
        { name: "Хирошима", nameEn: "Hiroshima" },
    ],
    "KR": [
        { name: "Сөүл", nameEn: "Seoul" },
        { name: "Пүсан", nameEn: "Busan" },
        { name: "Чэжү", nameEn: "Jeju" },
        { name: "Инчон", nameEn: "Incheon" },
        { name: "Кёнжү", nameEn: "Gyeongju" },
        { name: "Дэгү", nameEn: "Daegu" },
    ],
    "TH": [
        { name: "Бангкок", nameEn: "Bangkok" },
        { name: "Пүкэт", nameEn: "Phuket" },
        { name: "Чианг Май", nameEn: "Chiang Mai" },
        { name: "Паттая", nameEn: "Pattaya" },
        { name: "Ко Самуй", nameEn: "Koh Samui" },
        { name: "Краби", nameEn: "Krabi" },
    ],
    "CN": [
        { name: "Бээжин", nameEn: "Beijing" },
        { name: "Шанхай", nameEn: "Shanghai" },
        { name: "Гуанжоу", nameEn: "Guangzhou" },
        { name: "Шэньжэнь", nameEn: "Shenzhen" },
        { name: "Сиань", nameEn: "Xi'an" },
        { name: "Чэнду", nameEn: "Chengdu" },
        { name: "Хангжоу", nameEn: "Hangzhou" },
        { name: "Эрлянь", nameEn: "Erlian" },
        { name: "Хөххот", nameEn: "Hohhot" },
    ],
    "SG": [
        { name: "Сингапур хот", nameEn: "Singapore City" },
    ],
    "US": [
        { name: "Нью-Йорк", nameEn: "New York" },
        { name: "Лос-Анжелес", nameEn: "Los Angeles" },
        { name: "Сан-Франциско", nameEn: "San Francisco" },
        { name: "Лас-Вегас", nameEn: "Las Vegas" },
        { name: "Чикаго", nameEn: "Chicago" },
        { name: "Хавай", nameEn: "Hawaii" },
        { name: "Майами", nameEn: "Miami" },
        { name: "Вашингтон", nameEn: "Washington D.C." },
        { name: "Сиэтл", nameEn: "Seattle" },
    ],
    "VN": [
        { name: "Хо Ши Мин", nameEn: "Ho Chi Minh City" },
        { name: "Ханой", nameEn: "Hanoi" },
        { name: "Да Нанг", nameEn: "Da Nang" },
        { name: "Ня Чанг", nameEn: "Nha Trang" },
        { name: "Хой Ан", nameEn: "Hoi An" },
        { name: "Фу Куок", nameEn: "Phu Quoc" },
    ],
    "MY": [
        { name: "Куала Лумпур", nameEn: "Kuala Lumpur" },
        { name: "Пенанг", nameEn: "Penang" },
        { name: "Лангкави", nameEn: "Langkawi" },
        { name: "Жохор Бару", nameEn: "Johor Bahru" },
        { name: "Кота Кинабалу", nameEn: "Kota Kinabalu" },
    ],
    "ID": [
        { name: "Бали", nameEn: "Bali" },
        { name: "Жакарта", nameEn: "Jakarta" },
        { name: "Йогякарта", nameEn: "Yogyakarta" },
        { name: "Ломбок", nameEn: "Lombok" },
        { name: "Сурабая", nameEn: "Surabaya" },
    ],
    "PH": [
        { name: "Манила", nameEn: "Manila" },
        { name: "Себү", nameEn: "Cebu" },
        { name: "Борокай", nameEn: "Boracay" },
        { name: "Палаван", nameEn: "Palawan" },
        { name: "Давао", nameEn: "Davao" },
    ],
};

const tripPurposes = [
    { id: 'tourist', icon: Camera, label: { mn: 'Жуулчлал', en: 'Tourism' } },
    { id: 'shopping', icon: ShoppingBag, label: { mn: 'Шопинг', en: 'Shopping' } },
    { id: 'business', icon: Map, label: { mn: 'Бизнес', en: 'Business' } },
    { id: 'medical', icon: Stethoscope, label: { mn: 'Эмчилгээ', en: 'Medical' } },
    { id: 'education', icon: GraduationCap, label: { mn: 'Боловсрол', en: 'Education' } },
];

export default function AITravelPlannerV2() {
    const router = useRouter();
    const { data: session } = useSession();

    // --- Wizard State ---
    const [step, setStep] = useState(1);

    // --- Step 2 & 3: Discovery State ---
    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<any>(null);
    const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);

    const [activeCategory, setActiveCategory] = useState("attraction");
    const [activitiesByCategory, setActivitiesByCategory] = useState<Record<string, any[]>>({});
    const [selectedActivities, setSelectedActivities] = useState<any[]>([]);

    const [itinerary, setItinerary] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Step 1: Preferences State ---
    const [destination, setDestination] = useState("");
    const [duration, setDuration] = useState(5);
    const [purposes, setPurposes] = useState<string[]>([]);
    const [budget, setBudget] = useState("mid");
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [city, setCity] = useState(""); // Current selection in dropdown
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [customCityInput, setCustomCityInput] = useState("");
    const [transportMode, setTransportMode] = useState("flight");
    const [language, setLanguage] = useState("mn");
    const [calendarOpen, setCalendarOpen] = useState(false);

    // --- Purpose Details ---
    const [medicalDetail, setMedicalDetail] = useState("");
    const [businessDetail, setBusinessDetail] = useState("");
    const [suggestedCities, setSuggestedCities] = useState<any[]>([]);
    const [isSuggestingCities, setIsSuggestingCities] = useState(false);

    // --- Hotel Filters ---
    const [hotelStars, setHotelStars] = useState("all");
    const [hotelArea, setHotelArea] = useState("all");

    const isMongolian = language === "mn";

    const addCity = (cityName: string) => {
        if (!cityName) return;
        setSelectedCities(prev => {
            if (prev.includes(cityName)) return prev;
            return [...prev, cityName];
        });
        setCity(""); // Reset dropdown
        setCustomCityInput(""); // Reset input
    };

    const removeCity = (cityName: string) => {
        setSelectedCities(prev => prev.filter(c => c !== cityName));
    };

    // --- Suggest Cities ---
    const fetchCitySuggestions = async () => {
        if (!destination || (purposes.length === 0)) return;
        setIsSuggestingCities(true);
        try {
            const res = await fetch("/api/ai/suggest-cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    purposes: purposes.join(", "),
                    medicalDetail,
                    businessDetail
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuggestedCities(data.suggestions);
            }
        } catch (error) {
            console.error("City suggestion failed:", error);
        } finally {
            setIsSuggestingCities(false);
        }
    };

    // Trigger suggestion when details change and cities are few
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedCities.length === 0 && destination && (medicalDetail.length > 3 || businessDetail.length > 3)) {
                fetchCitySuggestions();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [medicalDetail, businessDetail, destination, purposes, selectedCities.length]);

    // --- Helpers ---
    const togglePurpose = (id: string) => {
        setPurposes(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const fetchDiscoveryData = async (type: 'hotel' | 'attraction' | 'shopping' | 'medical' | 'dining' | 'education') => {
        setIsDiscoveryLoading(true);
        try {
            const res = await fetch("/api/ai/grounding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    city: selectedCities.join(", "),
                    purposes: purposes.join(", "),
                    budget,
                    type,
                    filters: type === 'hotel' ? { hotelStars, hotelArea } : undefined,
                    medicalDetail: purposes.includes('medical') ? medicalDetail : undefined,
                    businessDetail: purposes.includes('business') ? businessDetail : undefined
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (type === 'hotel') {
                    setHotels(data.options);
                } else {
                    setActivitiesByCategory(prev => ({
                        ...prev,
                        [type]: data.options
                    }));
                }
            }
        } catch (error) {
            console.error("Discovery failed:", error);
        } finally {
            setIsDiscoveryLoading(false);
        }
    };

    const toggleActivity = (activity: any) => {
        setSelectedActivities(prev =>
            prev.some(a => a.id === activity.id)
                ? prev.filter(a => a.id !== activity.id)
                : [...prev, activity]
        );
    };

    const handleFinalize = async () => {
        setStep(4);
        setIsGenerating(true);
        try {
            // Call the main itinerary API with selected hotel and activities
            const res = await fetch("/api/ai/itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    city: selectedCities.join(", "),
                    purposes: purposes.join(", "),
                    medicalDetail,
                    businessDetail,
                    budget,
                    startDate,
                    duration,
                    transportMode,
                    selectedHotel,
                    selectedActivities
                }),
            });
            const data = await res.json();
            setItinerary(data);
        } catch (error) {
            console.error("Finalization failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!destination) {
                alert(isMongolian ? "Destination сонгоно уу" : "Please select a destination");
                return;
            }
            if (purposes.length === 0) {
                alert(isMongolian ? "Аяллын зорилго сонгоно уу" : "Please select at least one purpose");
                return;
            }
            fetchDiscoveryData('hotel');
        }
        if (step === 2 && !selectedHotel) {
            alert(isMongolian ? "Буудал сонгоно уу" : "Please select a hotel");
            return;
        }
        if (step === 2) {
            // Pre-fetch first category for step 3
            fetchDiscoveryData('attraction');
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    // --- Components for Steps ---

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                            step === num ? "bg-emerald-600 text-white scale-110 shadow-md" :
                                step > num ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {step > num ? <Check className="w-4 h-4" /> : num}
                    </div>
                    {num < 4 && (
                        <div className={cn(
                            "w-8 h-1 mx-1 rounded-full",
                            step > num ? "bg-emerald-200" : "bg-slate-100"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => step > 1 ? handleBack() : router.back()}
                    className="rounded-full bg-white shadow-sm border border-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-emerald-500" />
                        {isMongolian ? "AI Аялал Төлөвлөгч V2" : "AI Travel Planner V2"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isMongolian ? "Дээд зэрэглэлийн нарийвчлалтай төлөвлөлт" : "Professional-grade precision planning"}
                    </p>
                </div>
            </div>

            <StepIndicator />

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Destination & City */}
                        <Card className="p-6 shadow-sm border-slate-100 rounded-2xl">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-500" />
                                {isMongolian ? "Хаашаа аялах вэ?" : "Where are you going?"}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                        {isMongolian ? "Улс" : "Country"}
                                    </label>
                                    <Select
                                        value={destination}
                                        onValueChange={(val) => {
                                            setDestination(val);
                                            setCity("");
                                        }}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                                            <SelectValue placeholder={isMongolian ? "Улс сонгох" : "Select Country"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {destinations.map((d) => (
                                                <SelectItem key={d.code} value={d.code}>
                                                    <span className="mr-2">{d.flag}</span>
                                                    {isMongolian ? d.name : d.nameEn}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                                        {isMongolian ? "Хот" : "City"}
                                    </label>
                                    <div className="space-y-3">
                                        {destination && CITY_SUGGESTIONS[destination] ? (
                                            <Select value={city} onValueChange={(val) => {
                                                if (val === 'custom') {
                                                    setCity('custom');
                                                } else {
                                                    addCity(val);
                                                }
                                            }}>
                                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                                                    <SelectValue placeholder={isMongolian ? "Хот нэмэх" : "Add City"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CITY_SUGGESTIONS[destination].map((c) => (
                                                        <SelectItem key={c.nameEn} value={c.nameEn}>
                                                            {isMongolian ? c.name : c.nameEn}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="custom">{isMongolian ? "Өөр хот (Гараар оруулах)" : "Other (Enter manually)"}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={isMongolian ? "Хот оруулах" : "Enter City"}
                                                    value={customCityInput}
                                                    onChange={(e) => setCustomCityInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCity(customCityInput)}
                                                    className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                                />
                                                <Button
                                                    onClick={() => addCity(customCityInput)}
                                                    variant="outline"
                                                    className="h-12 w-12 rounded-xl border-slate-100"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        )}

                                        {city === 'custom' && (
                                            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                                <Input
                                                    autoFocus
                                                    placeholder={isMongolian ? "Хотын нэр?" : "City Name?"}
                                                    value={customCityInput}
                                                    onChange={(e) => setCustomCityInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCity(customCityInput)}
                                                    className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                                />
                                                <Button
                                                    onClick={() => addCity(customCityInput)}
                                                    className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                >
                                                    {isMongolian ? "Нэмэх" : "Add"}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Selected Cities Tags */}
                                        {selectedCities.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {selectedCities.map((c) => (
                                                    <Badge
                                                        key={c}
                                                        variant="secondary"
                                                        className="pl-3 pr-1 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1.5 animate-in zoom-in-50 duration-200"
                                                    >
                                                        <span className="text-[11px] font-black">{c}</span>
                                                        <button
                                                            onClick={() => removeCity(c)}
                                                            className="p-0.5 hover:bg-emerald-100 rounded-full transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Purpose & Dates */}
                        <Card className="p-6 shadow-sm border-slate-100 rounded-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Backpack className="w-5 h-5 text-emerald-500" />
                                        {isMongolian ? "Аяллын зорилго" : "Trip Purposes"}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {tripPurposes.map((p) => {
                                            const Icon = p.icon;
                                            const isSelected = purposes.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => togglePurpose(p.id)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2",
                                                        isSelected
                                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                                            : "border-slate-100 hover:border-emerald-200 text-slate-500"
                                                    )}
                                                >
                                                    <Icon className={cn("w-6 h-6", isSelected ? "text-emerald-600" : "text-slate-400")} />
                                                    <span className="text-xs font-bold leading-tight">{isMongolian ? p.label.mn : p.label.en}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Detailed Inputs for Medical/Business */}
                                    {purposes.includes('medical') && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                                <Stethoscope className="w-3.5 h-3.5" />
                                                {isMongolian ? "Эмчилгээний дэлгэрэнгүй" : "Medical Treatment Details"}
                                            </label>
                                            <Input
                                                placeholder={isMongolian ? "Ямар төрлийн оношилгоо, эмчилгээ хийлгэх вэ?" : "What kind of check-up or treatment?"}
                                                value={medicalDetail}
                                                onChange={(e) => setMedicalDetail(e.target.value)}
                                                className="h-12 rounded-xl border-emerald-100 focus-visible:ring-emerald-500"
                                            />
                                            {isSuggestingCities && (
                                                <div className="flex items-center gap-2 text-[10px] text-emerald-600 animate-pulse font-bold ml-1">
                                                    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                    {isMongolian ? "Тохиромжтой хотуудыг хайж байна..." : "Searching for best cities..."}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {purposes.includes('business') && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                                <Map className="w-3.5 h-3.5" />
                                                {isMongolian ? "Бизнесийн дэлгэрэнгүй" : "Business Trip Details"}
                                            </label>
                                            <Input
                                                placeholder={isMongolian ? "Бизнесийн салбар, зорилго (жишээ нь: үзэсгэлэн, уулзалт)" : "Industry and purpose (e.g., expo, meeting)"}
                                                value={businessDetail}
                                                onChange={(e) => setBusinessDetail(e.target.value)}
                                                className="h-12 rounded-xl border-emerald-100 focus-visible:ring-emerald-500"
                                            />
                                            {isSuggestingCities && (
                                                <div className="flex items-center gap-2 text-[10px] text-emerald-600 animate-pulse font-bold ml-1">
                                                    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                    {isMongolian ? "Тохиромжтой хотуудыг хайж байна..." : "Searching for best cities..."}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* City Suggestions UI - Moved up for better visibility */}
                                    {!city && suggestedCities.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 space-y-3 shadow-sm border-dashed"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-black text-emerald-700 flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    {isMongolian ? "AI ЗӨВЛӨГӨӨ: ХОТ СОНГОХ" : "AI SUGGESTION: CHOOSE CITY"}
                                                </p>
                                                <button onClick={() => setSuggestedCities([])} className="text-slate-400 hover:text-slate-600">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {suggestedCities.map((s, idx) => {
                                                    const cityName = isMongolian ? s.nameMn : s.name;
                                                    const isSelected = selectedCities.includes(cityName);

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => isSelected ? removeCity(cityName) : addCity(cityName)}
                                                            className={cn(
                                                                "p-3 rounded-xl border text-left transition-all group flex items-start gap-3",
                                                                isSelected
                                                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                                                                    : "bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shrink-0",
                                                                isSelected ? "bg-white/20 border-white/20" : "bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white"
                                                            )}>
                                                                <MapPin className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className={cn("text-sm font-black", isSelected ? "text-white" : "text-slate-900")}>{cityName}</p>
                                                                    {isSelected ? <Check className="w-4 h-4 text-white" /> : <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-1 transition-transform" />}
                                                                </div>
                                                                <p className={cn("text-[10px] leading-tight mt-0.5", isSelected ? "text-emerald-50" : "text-slate-500")}>{s.reason}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-emerald-500" />
                                        {isMongolian ? "Хугацаа" : "Duration & Dates"}
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400">
                                                    {isMongolian ? "Төлөвлөж буй хоног" : "Duration (days)"}
                                                </label>
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-black">
                                                    {duration} {isMongolian ? "хоног" : "days"}
                                                </Badge>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="30"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                                className="w-full accent-emerald-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 px-1">
                                                {isMongolian ? "Эхлэх огноо" : "Start Date"}
                                            </label>
                                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        onClick={() => setCalendarOpen(true)}
                                                        className={cn(
                                                            "w-full h-12 justify-start text-left font-normal rounded-xl border-slate-100 bg-slate-50",
                                                            !startDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "PPP") : (isMongolian ? "Огноо сонгох" : "Pick a date")}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={(date) => {
                                                            setStartDate(date);
                                                            setTimeout(() => setCalendarOpen(false), 200);
                                                        }}
                                                        initialFocus
                                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                        className="p-4"
                                                        classNames={{
                                                            day_selected: "bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white focus:bg-emerald-600 focus:text-white",
                                                            day_today: "bg-emerald-50 text-emerald-600 font-bold",
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Transport & Budget */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-6 shadow-sm border-slate-100 rounded-2xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-emerald-500" />
                                    {isMongolian ? "Тээврийн хэрэгсэл" : "Transport Mode"}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'flight', icon: Plane, label: isMongolian ? 'Нисэх' : 'Flight' },
                                        { id: 'train', icon: TrainFront, label: isMongolian ? 'Галт тэрэг' : 'Train' },
                                        { id: 'bus', icon: Bus, label: isMongolian ? 'Автобус' : 'Bus' },
                                        { id: 'car', icon: Car, label: isMongolian ? 'Машин' : 'Car' },
                                    ].map((mode) => {
                                        const Icon = mode.icon;
                                        return (
                                            <button
                                                key={mode.id}
                                                onClick={() => setTransportMode(mode.id)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5",
                                                    transportMode === mode.id
                                                        ? "bg-emerald-600 border-emerald-600 text-white"
                                                        : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                                                )}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">{mode.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>

                            <Card className="p-6 shadow-sm border-slate-100 rounded-2xl">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-500" />
                                    {isMongolian ? "Төсөв" : "Budget Level"}
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'budget', icon: DollarSign, label: isMongolian ? 'Хэмнэлттэй' : 'Budget', scale: '$' },
                                        { id: 'mid', icon: DollarSign, label: isMongolian ? 'Дундаж' : 'Economy', scale: '$$' },
                                        { id: 'luxury', icon: DollarSign, label: isMongolian ? 'Люкс' : 'Luxury', scale: '$$$' },
                                    ].map((b) => (
                                        <button
                                            key={b.id}
                                            onClick={() => setBudget(b.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1",
                                                budget === b.id
                                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className="text-sm font-black">{b.scale}</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{b.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleNext}
                                className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 group transition-all"
                            >
                                {isMongolian ? "Дараах" : "Next"}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">
                                {isMongolian ? "Хаана байрлах вэ? (Заавал биш)" : "Where to stay? (Optional)"}
                            </h2>
                            <p className="text-slate-500">
                                {isMongolian ? "Танд санал болгож буй шилдэг буудлууд" : "Our top recommended stays for you"}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">
                                    {isMongolian ? "Зэрэглэл (Од)" : "Rating (Stars)"}
                                </label>
                                <Select value={hotelStars} onValueChange={setHotelStars}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white border-none shadow-sm text-xs font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{isMongolian ? "Бүх зэрэглэл" : "All Ratings"}</SelectItem>
                                        <SelectItem value="3">3+ {isMongolian ? "од" : "stars"}</SelectItem>
                                        <SelectItem value="4">4+ {isMongolian ? "од" : "stars"}</SelectItem>
                                        <SelectItem value="5">5 {isMongolian ? "од" : "stars"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5 ">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">
                                    {isMongolian ? "Байршил" : "Area"}
                                </label>
                                <Select value={hotelArea} onValueChange={setHotelArea}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white border-none shadow-sm text-xs font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{isMongolian ? "Хамаагүй" : "Anywhere"}</SelectItem>
                                        <SelectItem value="center">{isMongolian ? "Хотын төв" : "City Center"}</SelectItem>
                                        <SelectItem value="transit">{isMongolian ? "Тээврийн зангилаа" : "Transport Hub"}</SelectItem>
                                        <SelectItem value="scenic">{isMongolian ? "Үзэмжтэй" : "Scenic/Quiet"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 flex items-end">
                                <Button
                                    onClick={() => fetchDiscoveryData('hotel')}
                                    variant="outline"
                                    className="w-full h-10 rounded-xl border-emerald-100 text-emerald-600 font-bold text-xs hover:bg-emerald-50 gap-2"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    {isMongolian ? "Шүүж хайх" : "Apply & Search"}
                                </Button>
                            </div>
                        </div>

                        {isDiscoveryLoading ? (
                            <Card className="p-12 text-center space-y-4 border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl">
                                <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    {isMongolian ? "Буудлуудыг хайж байна..." : "Searching for hotels..."}
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hotels.map((hotel: any) => (
                                    <Card
                                        key={hotel.id}
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative",
                                            selectedHotel?.id === hotel.id
                                                ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-100 ring-2 ring-emerald-500/20"
                                                : "border-slate-100 hover:border-emerald-200"
                                        )}
                                        onClick={() => setSelectedHotel(hotel)}
                                    >
                                        {selectedHotel?.id === hotel.id && (
                                            <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                                                <Check className="w-5 h-5 font-black" />
                                            </div>
                                        )}
                                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                            {hotel.imageUrl ? (
                                                <img
                                                    src={hotel.imageUrl}
                                                    alt={hotel.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                    onError={(e) => {
                                                        (e.target as any).src = `https://loremflickr.com/800/600/hotel,${encodeURIComponent(hotel.name.split(' ')[0])}`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                    <Hotel className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-white/90 text-emerald-600 font-bold backdrop-blur-sm border-none shadow-sm capitalize">
                                                    {hotel.price}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-900 text-sm">{hotel.name}</h4>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <Sparkles className="w-3 h-3 fill-current" />
                                                    <span className="text-xs font-bold">{hotel.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500 line-clamp-2">{hotel.description}</p>
                                            <div className="flex flex-col gap-2 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 max-w-[60%]">
                                                        <MapPin className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{hotel.address}</span>
                                                    </div>
                                                    {hotel.bookingUrl && (
                                                        <a
                                                            href={hotel.bookingUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                                        >
                                                            Booking.com
                                                            <Search className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {hotel.distanceFromAirport && (
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-lg font-bold w-fit">
                                                        <Plane className="w-3 h-3" />
                                                        {hotel.distanceFromAirport}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="h-14 px-8 rounded-2xl font-bold"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={isDiscoveryLoading || selectedCities.length === 0}
                                className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 group"
                            >
                                {!selectedHotel ? (isMongolian ? "Алгасах" : "Skip") : (isMongolian ? "Үргэлжлүүлэх" : "Continue")}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}
                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">
                                {isMongolian ? "Юу хийх вэ?" : "What will you do?"}
                            </h2>
                            <p className="text-slate-500">
                                {isMongolian ? "Өөрийн сонирхолд нийцсэн газруудыг сонгоорой" : "Choose the places that interest you most"}
                            </p>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {[
                                { id: 'attraction', icon: Camera, label: isMongolian ? 'Үзвэр' : 'Attractions', purpose: 'tourist' },
                                { id: 'shopping', icon: ShoppingBag, label: isMongolian ? 'Шопинг' : 'Shopping', purpose: 'shopping' },
                                { id: 'medical', icon: Stethoscope, label: isMongolian ? 'Эмчилгээ' : 'Medical', purpose: 'medical' },
                                { id: 'dining', icon: Utensils, label: isMongolian ? 'Хоол' : 'Dining', purpose: 'all' },
                                { id: 'education', icon: GraduationCap, label: isMongolian ? 'Боловсрол' : 'Education', purpose: 'education' },
                            ]
                                .filter(cat => cat.purpose === 'all' || purposes.length === 0 || purposes.includes(cat.purpose))
                                .map((cat) => {
                                    const Icon = cat.icon;
                                    const isActive = activeCategory === cat.id;
                                    return (
                                        <Button
                                            key={cat.id}
                                            variant={isActive ? "default" : "outline"}
                                            onClick={() => {
                                                setActiveCategory(cat.id);
                                                if (!activitiesByCategory[cat.id]) {
                                                    fetchDiscoveryData(cat.id as any);
                                                }
                                            }}
                                            className={cn(
                                                "rounded-full h-10 px-6 font-bold gap-2",
                                                isActive ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-100 text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {cat.label}
                                        </Button>
                                    );
                                })}
                        </div>

                        {isDiscoveryLoading ? (
                            <Card className="p-12 text-center space-y-4 border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl">
                                <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    {isMongolian ? "Газруудыг хайж байна..." : "Searching for places..."}
                                </p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(activitiesByCategory[activeCategory] || []).map((activity: any) => (
                                    <Card
                                        key={activity.id}
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative",
                                            selectedActivities.some(a => a.id === activity.id)
                                                ? "border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20"
                                                : "border-slate-100 hover:border-emerald-200"
                                        )}
                                        onClick={() => toggleActivity(activity)}
                                    >
                                        {selectedActivities.some(a => a.id === activity.id) && (
                                            <div className="absolute top-2 right-2 z-10 bg-emerald-600 text-white p-1 rounded-full shadow-sm border border-white">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="p-4 flex gap-4">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-100 shrink-0 overflow-hidden relative flex items-center justify-center border border-slate-200 shadow-inner">
                                                {activity.imageUrl ? (
                                                    <img
                                                        src={activity.imageUrl}
                                                        alt={activity.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                        onError={(e) => {
                                                            const fallbacks: Record<string, string> = {
                                                                hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=60&w=200',
                                                                attraction: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=60&w=200',
                                                                shopping: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=60&w=200',
                                                                medical: 'https://images.unsplash.com/photo-1519494026892-80bbd2d670db?auto=format&fit=crop&q=60&w=200',
                                                                dining: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=60&w=200',
                                                                education: 'https://images.unsplash.com/photo-1523050335191-51ff18ffb9b9?auto=format&fit=crop&q=60&w=200'
                                                            };
                                                            (e.target as any).src = fallbacks[activeCategory] || fallbacks.attraction;
                                                        }}
                                                    />
                                                ) : (
                                                    activity.type === 'medical' ? <Stethoscope className="w-8 h-8 text-emerald-600 opacity-50" /> :
                                                        activity.type === 'shopping' ? <ShoppingBag className="w-8 h-8 text-emerald-600 opacity-50" /> :
                                                            <Camera className="w-8 h-8 text-emerald-600 opacity-50" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900 text-sm">{activity.name}</h4>
                                                    {selectedActivities.some(a => a.id === activity.id) && (
                                                        <Check className="w-4 h-4 text-emerald-600" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2">{activity.description}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{activity.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {(!activitiesByCategory[activeCategory] || activitiesByCategory[activeCategory].length === 0) && !isDiscoveryLoading && (
                                    <div className="col-span-full py-12 text-center text-slate-400">
                                        {isMongolian ? "Энэ ангилалд одоогоор илэрц олдсонгүй." : "No results found for this category."}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">
                                        {selectedActivities.length} {isMongolian ? "газар сонгосон байна" : "places selected"}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        {isMongolian ? "Таны сонгосон газруудыг AI ашиглан нэгдсэн маршрут болгоно." : "We will weave these places into your custom AI itinerary."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="h-14 px-8 rounded-2xl font-bold"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <Button
                                onClick={handleFinalize}
                                disabled={selectedActivities.length === 0 || isDiscoveryLoading}
                                className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 group"
                            >
                                {isMongolian ? "Төлөвлөгөө гаргах" : "Generate Plan"}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {isGenerating ? (
                            <div className="py-20 text-center space-y-6">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 text-emerald-600 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900">
                                        {isMongolian ? "Төлөвлөгөө боловсруулж байна..." : "Generating your itinerary..."}
                                    </h2>
                                    <p className="text-slate-500 animate-pulse">
                                        {isMongolian ? "Таны сонголтод тулгуурлан хамгийн сайн маршрутыг зохиож байна." : "Crafting the perfect route based on your selections."}
                                    </p>
                                </div>
                            </div>
                        ) : itinerary ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Itinerary Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex justify-between items-end bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <div>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-none mb-2">
                                                {itinerary.city || destination} • {itinerary.duration} {isMongolian ? "хоног" : "days"}
                                            </Badge>
                                            <h1 className="text-3xl font-black text-slate-900">
                                                {isMongolian ? "Аяллын Маршрут" : "Travel Itinerary"}
                                            </h1>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                                {isMongolian ? "Нийт төсөв" : "Total Budget"}
                                            </p>
                                            <p className="text-xl font-black text-emerald-600">
                                                {itinerary.totalBudget}
                                            </p>
                                        </div>
                                    </div>

                                    {itinerary.days?.map((day: any) => (
                                        <Card key={day.day} className="overflow-hidden border-slate-100 shadow-sm rounded-3xl">
                                            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black">
                                                        {day.day}
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">{day.title}</h3>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {day.activities.map((act: any, idx: number) => (
                                                    <div key={idx} className="relative pl-8 group last:pb-0 pb-6 border-l-2 border-slate-100 ml-3">
                                                        <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 group-hover:scale-110 transition-transform" />
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-black text-emerald-600">{act.time}</span>
                                                                <Badge variant="outline" className="text-[10px] border-slate-100 bg-white font-black text-slate-500">
                                                                    {act.cost}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-bold text-slate-900">{act.activity}</h4>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{act.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Sidebar Column */}
                                <div className="space-y-6">
                                    <Card className="p-4 rounded-3xl border-slate-100 shadow-sm overflow-hidden">
                                        <h3 className="font-bold mb-3 flex items-center gap-2 px-2">
                                            <Map className="w-4 h-4 text-emerald-500" />
                                            {isMongolian ? "Маршрут харах" : "View Route"}
                                        </h3>
                                        <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                                            <ItineraryMap
                                                activities={itinerary.days?.flatMap((day: any) =>
                                                    day.activities.map((act: any) => ({
                                                        ...act,
                                                        day: day.day,
                                                        title: act.activity
                                                    }))
                                                ) || []}
                                            />
                                        </div>
                                    </Card>

                                    {itinerary.visaRequirement && (
                                        <Card className="p-6 rounded-3xl border-slate-100 shadow-sm bg-blue-50 border-blue-100">
                                            <h3 className="font-black text-lg mb-3 flex items-center gap-2 text-blue-900">
                                                <Search className="w-5 h-5 text-blue-600" />
                                                {isMongolian ? "Визний мэдээлэл" : "Visa Information"}
                                            </h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn(
                                                        "font-black border-none",
                                                        itinerary.visaRequirement.needed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                                    )}>
                                                        {itinerary.visaRequirement.needed ?
                                                            (isMongolian ? "Виз шаардлагатай" : "Visa Needed") :
                                                            (isMongolian ? "Визгүй" : "Visa-Free")}
                                                    </Badge>
                                                    <span className="text-sm font-bold text-blue-800">{itinerary.visaRequirement.type}</span>
                                                </div>
                                                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                                    {itinerary.visaRequirement.details}
                                                </p>
                                            </div>
                                        </Card>
                                    )}

                                    <Card className="p-6 rounded-3xl border-slate-100 shadow-sm bg-slate-900 text-white">
                                        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                                            <Smartphone className="w-5 h-5 text-emerald-400" />
                                            GateSIM eSIM
                                        </h3>
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {isMongolian
                                                    ? "Энэ аялалд хамгийн тохиромжтой дата багцыг санал болгож байна."
                                                    : "Recommended data package for your trip."}
                                            </p>
                                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                                <p className="text-xs font-bold text-emerald-400 uppercase mb-1">
                                                    {itinerary.esimRecommendation || "Travel Package"}
                                                </p>
                                                <Button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 border-none font-black">
                                                    {isMongolian ? "Худалдаж авах" : "Buy Now"}
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <p className="text-slate-500">{isMongolian ? "Төлөвлөгөө авахад алдаа гарлаа." : "Failed to load itinerary."}</p>
                                <Button onClick={handleFinalize}>{isMongolian ? "Дахин оролдох" : "Retry"}</Button>
                            </div>
                        )}

                        <div className="flex justify-between pt-8 border-t border-slate-100">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                className="h-14 px-8 rounded-2xl font-bold"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 p-0">
                                    <Share2 className="w-5 h-5 text-slate-400" />
                                </Button>
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black">
                                    <Download className="w-5 h-5 mr-2" />
                                    {isMongolian ? "Хадгалах" : "Save"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
