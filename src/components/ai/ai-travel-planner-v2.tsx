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
    Briefcase,
    Palmtree,
    Mountain,
    Users,
    Heart,
    Landmark,
    Ticket,
    Package,
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
    { id: 'tourist', icon: Camera, label: { mn: 'Жуулчлал', en: 'Tourism' }, desc: { mn: 'Ерөнхий үзвэрүүд, алдартай газрууд', en: 'General sightseeing and popular attractions' } },
    { id: 'relaxation', icon: Palmtree, label: { mn: 'Амралт', en: 'Relaxation' }, desc: { mn: 'Алжаал тайлах, спа, сувилал', en: 'Leisure, spa, and wellness' } },
    { id: 'adventure', icon: Mountain, label: { mn: 'Адал явдал', en: 'Adventure' }, desc: { mn: 'Экстрим спорт, идэвхтэй хөдөлгөөн', en: 'Active sports and thrilling activities' } },
    { id: 'family', icon: Users, label: { mn: 'Гэр бүл', en: 'Family' }, desc: { mn: 'Хүүхдэд ээлтэй, аюулгүй газрууд', en: 'Safe and fun spots for kids and adults' } },
    { id: 'romantic', icon: Heart, label: { mn: 'Романтик', en: 'Romantic' }, desc: { mn: 'Хосуудад зориулсан тусгай газрууд', en: 'Special spots for couples and honeymoons' } },
    { id: 'culture', icon: Landmark, label: { mn: 'Соёл', en: 'Culture' }, desc: { mn: 'Музей, түүхэн дурсгалт газрууд', en: 'History, museums and local heritage' } },
    { id: 'shopping', icon: ShoppingBag, label: { mn: 'Шопинг', en: 'Shopping' }, desc: { mn: 'Худалдааны төвүүд, захууд', en: 'Malls, markets and boutiques' } },
    { id: 'foodie', icon: Utensils, label: { mn: 'Хоол аялал', en: 'Foodie' }, desc: { mn: 'Ресторан, хоолны туршлагууд', en: 'Fine dining and local specialties' } },
    { id: 'procurement', icon: Package, label: { mn: 'Бараа таталт', en: 'Procurement' }, desc: { mn: 'Бөөний төвүүд, бараа бэлтгэл, үйлдвэр', en: 'Wholesale markets, sourcing, and factories' } },
    { id: 'business', icon: Briefcase, label: { mn: 'Бизнес', en: 'Business' }, desc: { mn: 'Уулзалт, ажил хэргийн хэрэгцээ', en: 'Work-related and professional events' } },
    { id: 'medical', icon: Stethoscope, label: { mn: 'Эмчилгээ', en: 'Medical' }, desc: { mn: 'Эрүүл мэнд, оношилгоо, сувилгаа', en: 'Check-ups, treatments and recovery' } },
    { id: 'education', icon: GraduationCap, label: { mn: 'Боловсрол', en: 'Education' }, desc: { mn: 'Сургууль, сургалт, сургалтын аялал', en: 'Schools, courses and study tours' } },
    { id: 'event', icon: Ticket, label: { mn: 'Арга хэмжээ', en: 'Event' }, desc: { mn: 'Концерт, наадам, фестиваль', en: 'Festivals, concerts and exhibitions' } },
];

export default function AITravelPlannerV2() {
    const router = useRouter();
    const { data: session } = useSession();

    // --- Wizard State ---
    const [step, setStep] = useState(1);

    // --- Step 1: Preferences State ---
    const [destination, setDestination] = useState("");
    const [duration, setDuration] = useState(5);
    const [purposes, setPurposes] = useState<string[]>([]);
    const [budget, setBudget] = useState("mid");
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [city, setCity] = useState(""); // Current selection in dropdown
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [cityRoute, setCityRoute] = useState<{ name: string, days: number }[]>([]);
    const [activeCityTab, setActiveCityTab] = useState("");
    const [customCityInput, setCustomCityInput] = useState("");
    const [transportMode, setTransportMode] = useState("flight");
    const [language, setLanguage] = useState("mn");
    const [calendarOpen, setCalendarOpen] = useState(false);

    // --- Purpose Details ---
    const [purposeDetails, setPurposeDetails] = useState<Record<string, string>>({});
    const [suggestedCities, setSuggestedCities] = useState<any[]>([]);
    const [isSuggestingCities, setIsSuggestingCities] = useState(false);

    // --- Discovery State ---
    const [hotels, setHotels] = useState<any[]>([]);
    const [selectedHotels, setSelectedHotels] = useState<Record<string, any>>({});
    const [isDiscoveryLoading, setIsDiscoveryLoading] = useState(false);

    const [activeCategory, setActiveCategory] = useState<"attraction" | "shopping" | "dining" | "medical" | "education">("attraction");
    const [activitiesByCategory, setActivitiesByCategory] = useState<Record<string, any[]>>({});
    const [selectedActivities, setSelectedActivities] = useState<any[]>([]);
    const [itinerary, setItinerary] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

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

    const updateCityDays = (name: string, days: number) => {
        setCityRoute(prev => prev.map(c => c.name === name ? { ...c, days } : c));
    };

    const reorderCities = (fromIndex: number, toIndex: number) => {
        const newRoute = [...cityRoute];
        const [moved] = newRoute.splice(fromIndex, 1);
        newRoute.splice(toIndex, 0, moved);
        setCityRoute(newRoute);
    };

    // Auto-distribute days when selectedCities or duration changes
    useEffect(() => {
        if (selectedCities.length === 0) {
            setCityRoute([]);
            return;
        }

        const baseDays = Math.floor(duration / selectedCities.length);
        const extraDays = duration % selectedCities.length;

        const newRoute = selectedCities.map((name, idx) => ({
            name,
            days: idx < extraDays ? baseDays + 1 : baseDays
        }));

        setCityRoute(newRoute);
    }, [selectedCities, duration]);

    // --- Suggest Cities ---
    const fetchCitySuggestions = async () => {
        if (!destination || (purposes.length === 0)) return;
        setIsSuggestingCities(true);
        try {
            // Combine all purpose details into one string for the API
            const combinedDetails = Object.entries(purposeDetails)
                .filter(([id, val]) => purposes.includes(id) && val.length > 0)
                .map(([id, val]) => `${id}: ${val}`)
                .join(", ");

            const res = await fetch("/api/ai/suggest-cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    purposes: purposes.join(", "),
                    details: combinedDetails
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
            const hasEnoughDetail = Object.values(purposeDetails).some(v => v.length > 2);
            if (selectedCities.length === 0 && destination && (purposes.length > 0 || hasEnoughDetail)) {
                fetchCitySuggestions();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [purposeDetails, destination, purposes, selectedCities.length]);

    // --- Helpers ---
    const togglePurpose = (id: string) => {
        setPurposes(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const fetchDiscoveryData = async (type: 'hotel' | 'attraction' | 'shopping' | 'medical' | 'dining' | 'education', targetCity: string) => {
        setIsDiscoveryLoading(true);
        try {
            const res = await fetch("/api/ai/grounding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    city: targetCity,
                    purposes: purposes.join(", "),
                    budget,
                    type,
                    filters: type === 'hotel' ? { hotelStars, hotelArea } : undefined,
                    purposeDetails
                }),
            });
            const data = await res.json();
            if (data.success) {
                if (type === 'hotel') {
                    setHotels(data.options);
                    // Smart default: If no hotel selected for this city, pick the first one
                    if (!selectedHotels[targetCity] && data.options.length > 0) {
                        setSelectedHotels(prev => ({ ...prev, [targetCity]: data.options[0] }));
                    }
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
        setStep(5);
        setIsGenerating(true);
        try {
            // Call the main itinerary API with selected hotel and activities
            const res = await fetch("/api/ai/itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    cityRoute,
                    purposes: purposes.join(", "),
                    purposeDetails,
                    budget,
                    startDate,
                    duration,
                    transportMode,
                    selectedHotels,
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
        }
        if (step === 2) {
            if (selectedCities.length === 0) {
                alert(isMongolian ? "Хот сонгоно уу" : "Please select at least one city");
                return;
            }
            const firstCity = cityRoute[0]?.name || "";
            setActiveCityTab(firstCity);
            fetchDiscoveryData('hotel', firstCity);
        }
        if (step === 3) {
            const firstCity = cityRoute[0]?.name || "";
            setActiveCityTab(firstCity);
            fetchDiscoveryData('attraction', firstCity);
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    // --- Components for Steps ---

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((num) => (
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
                    {num < 5 && (
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
                    className="rounded-full bg-white shadow-md border border-slate-100 hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-700" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2 whitespace-nowrap">
                        <Sparkles className="w-6 h-6 text-emerald-500 shrink-0" />
                        <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 bg-clip-text text-transparent">
                            {isMongolian ? "Gate Аялал Төлөвлөгч" : "Gate Travel Planner"}
                        </span>
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
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Төлөвлөгөө эхлүүлэх" : "Start Planning"}</h2>
                            <p className="text-slate-500">{isMongolian ? "Аяллынхаа үндсэн мэдээллийг оруулна уу" : "Enter your basic trip details"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Улс" : "Country"}</label>
                                    <Select value={destination} onValueChange={setDestination}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100">
                                            <SelectValue placeholder={isMongolian ? "Улс сонгох" : "Select Country"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {destinations.map((d) => (
                                                <SelectItem key={d.code} value={d.code}><span className="mr-2">{d.flag}</span>{isMongolian ? d.name : d.nameEn}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Огноо" : "Date"}</label>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full h-14 justify-start text-left font-bold rounded-2xl border-slate-100 bg-slate-50">
                                                <CalendarIcon className="mr-2 h-5 w-5 text-emerald-500" />
                                                {startDate ? format(startDate, "PPP") : (isMongolian ? "Огноо сонгох" : "Pick a date")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(d) => { setStartDate(d); setCalendarOpen(false); }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Нийт хоног" : "Total Days"}</label>
                                        <Badge className="bg-emerald-100 text-emerald-700 font-black">{duration} {isMongolian ? "хоног" : "days"}</Badge>
                                    </div>
                                    <input type="range" min="1" max="30" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full accent-emerald-600" />
                                </div>
                            </Card>

                            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Зорилго" : "Purposes"}</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {tripPurposes.map((p) => {
                                        const Icon = p.icon;
                                        const isSelected = purposes.includes(p.id);
                                        return (
                                            <div key={p.id} className="space-y-3">
                                                <button
                                                    onClick={() => togglePurpose(p.id)}
                                                    className={cn(
                                                        "w-full p-4 rounded-2xl border-2 transition-all flex items-start gap-4 text-left group",
                                                        isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-50/50" : "border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                                                        isSelected ? "bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="space-y-0.5 flex-1">
                                                        <p className={cn("text-sm font-black transition-colors", isSelected ? "text-emerald-700" : "text-slate-600 uppercase tracking-wide")}>
                                                            {isMongolian ? p.label.mn : p.label.en}
                                                        </p>
                                                        <p className="text-[10px] font-medium leading-relaxed opacity-80 line-clamp-1">
                                                            {isMongolian ? p.desc.mn : p.desc.en}
                                                        </p>
                                                    </div>
                                                    {isSelected && <Check className="w-4 h-4 text-emerald-600 ml-auto shrink-0 mt-1" />}
                                                </button>

                                                <AnimatePresence>
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden px-1"
                                                        >
                                                            <div className="space-y-2 p-4 bg-white border border-emerald-100 rounded-2xl shadow-inner">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Sparkles className="w-3 h-3 text-emerald-500" />
                                                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                                                                        {isMongolian ? `${p.label.mn} хэрэгцээ` : `${p.label.en} Needs`}
                                                                    </label>
                                                                </div>
                                                                <Textarea
                                                                    placeholder={isMongolian ? `Жишээ нь: ${p.id === 'medical' ? 'Гоо сайхны хагалгаа' : p.id === 'business' ? 'Хурлаар явах' : p.id === 'procurement' ? 'Тавилга, бэлэн хувцас татах' : p.id === 'family' ? 'Хүүхдийн парк' : 'Таны тусгай хэрэгцээ...'}` : `e.g. Specific details for ${p.label.en.toLowerCase()}...`}
                                                                    value={purposeDetails[p.id] || ""}
                                                                    onChange={(e) => setPurposeDetails(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                                    className="min-h-[80px] bg-slate-50 border-none rounded-xl text-xs font-medium placeholder:text-slate-300 focus-visible:ring-emerald-500 resize-none"
                                                                />
                                                                <p className="text-[9px] text-slate-400 italic">
                                                                    {isMongolian ? "* AI таны тайлбарт тохирсон хот, газруудыг санал болгоно." : "* AI will suggest cities and spots matching your description."}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>

                        <Button onClick={handleNext} className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-black text-white text-lg font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3">
                            {isMongolian ? "Үргэлжлүүлэх" : "Continue"}
                            <ArrowRight className="w-6 h-6" />
                        </Button>
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
                            <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Маршрут боловсруулах" : "Plan Your Route"}</h2>
                            <p className="text-slate-500">{isMongolian ? "Аялах хотуудаа сонгож, хуваариа гаргана уу" : "Select cities and distribute your days"}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                                    {/* AI Suggested Cities */}
                                    {(isSuggestingCities || suggestedCities.length > 0) && (
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                    {isMongolian ? "AI-ийн санал болгож буй хотууд" : "AI Suggested Cities"}
                                                </h4>
                                            </div>

                                            {isSuggestingCities ? (
                                                <div className="flex gap-2 overflow-x-auto pb-1">
                                                    {[1, 2, 3].map(i => <div key={i} className="h-12 w-32 bg-slate-50 animate-pulse rounded-xl shrink-0" />)}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {suggestedCities.map((c) => (
                                                        <button
                                                            key={c.name}
                                                            onClick={() => addCity(c.name)}
                                                            disabled={selectedCities.includes(c.name)}
                                                            className={cn(
                                                                "group text-left px-4 py-3 rounded-2xl border-2 transition-all max-w-[200px] relative",
                                                                selectedCities.includes(c.name)
                                                                    ? "border-emerald-100 bg-emerald-50 opacity-40 grayscale cursor-not-allowed"
                                                                    : "border-slate-50 bg-white hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-black text-slate-900 truncate pr-2">{isMongolian ? c.nameMn : c.name}</span>
                                                                <Plus className="w-3 h-3 text-emerald-500 shrink-0" />
                                                            </div>
                                                            <p className="text-[9px] text-slate-400 font-medium leading-tight line-clamp-2 italic">
                                                                {c.reason}
                                                            </p>
                                                            {selectedCities.includes(c.name) && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <Check className="w-5 h-5 text-emerald-600" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            {destination && CITY_SUGGESTIONS[destination] ? (
                                                <Select value={city} onValueChange={(val) => { if (val === 'custom') setCity('custom'); else addCity(val); }}>
                                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                                                        <SelectValue placeholder={isMongolian ? "Хот нэмэх" : "Add City"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CITY_SUGGESTIONS[destination].map((c) => (
                                                            <SelectItem key={c.nameEn} value={c.nameEn}>{isMongolian ? c.name : c.nameEn}</SelectItem>
                                                        ))}
                                                        <SelectItem value="custom">{isMongolian ? "Өөр хот..." : "Other city..."}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Input placeholder={isMongolian ? "Хот оруулах" : "Enter City"} value={customCityInput} onChange={(e) => setCustomCityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCity(customCityInput)} className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
                                                    <Button onClick={() => addCity(customCityInput)} variant="outline" className="h-14 w-14 rounded-2xl border-slate-100"><Plus className="w-6 h-6" /></Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {city === 'custom' && (
                                        <div className="flex gap-2 animate-in slide-in-from-top-4 duration-300">
                                            <Input autoFocus placeholder={isMongolian ? "Хотын нэр?" : "City Name?"} value={customCityInput} onChange={(e) => setCustomCityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCity(customCityInput)} className="h-14 rounded-2xl bg-slate-50 border-slate-100" />
                                            <Button onClick={() => addCity(customCityInput)} className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black">Нэмэх</Button>
                                        </div>
                                    )}

                                    <div className="space-y-8 pt-4">
                                        {cityRoute.map((c, idx) => (
                                            <div key={idx} className="relative pl-12">
                                                {idx < cityRoute.length - 1 && (
                                                    <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-100" />
                                                )}
                                                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center z-10 shadow-sm">
                                                    <span className="text-xs font-black text-emerald-600">{idx + 1}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all">
                                                    <div>
                                                        <h4 className="font-black text-slate-900">{c.name}</h4>
                                                        <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-100 font-bold mt-1">{c.days} {isMongolian ? "хоног" : "days"}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex bg-white rounded-xl border border-slate-100 p-1">
                                                            <button onClick={() => updateCityDays(c.name, Math.max(1, c.days - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 font-black">-</button>
                                                            <div className="w-10 flex items-center justify-center font-black text-xs">{c.days}</div>
                                                            <button onClick={() => updateCityDays(c.name, c.days + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 font-black">+</button>
                                                        </div>
                                                        <button onClick={() => removeCity(c.name)} className="p-2 hover:bg-red-50 hover:text-red-600 text-slate-300 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" />
                                            {isMongolian ? "Төсөв" : "Budget"}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'budget', label: isMongolian ? 'Хэмнэлттэй' : 'Budget', icon: '💰' },
                                                { id: 'mid', label: isMongolian ? 'Дундаж' : 'Economy', icon: '⚖️' },
                                                { id: 'luxury', label: isMongolian ? 'Люкс' : 'Luxury', icon: '💎' },
                                            ].map((b) => (
                                                <button key={b.id} onClick={() => setBudget(b.id)} className={cn("p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center", budget === b.id ? "border-emerald-500 bg-emerald-50" : "border-slate-50 hover:border-slate-200")}>
                                                    <span className="font-black text-slate-900">{b.label}</span>
                                                    <span>{b.icon}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Plane className="w-4 h-4" />
                                            {isMongolian ? "Тээвэр" : "Transport"}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'flight', icon: Plane, label: isMongolian ? 'Нисэх' : 'Flight' },
                                                { id: 'train', icon: TrainFront, label: isMongolian ? 'Галт тэрэг' : 'Train' },
                                                { id: 'bus', icon: Bus, label: isMongolian ? 'Автобус' : 'Bus' },
                                                { id: 'car', icon: Car, label: isMongolian ? 'Машин' : 'Car' },
                                            ].map((m) => (
                                                <button key={m.id} onClick={() => setTransportMode(m.id)} className={cn("p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all", transportMode === m.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-50 text-slate-400 hover:border-slate-200")}>
                                                    <m.icon className="w-5 h-5" />
                                                    <span className="text-[10px] font-black">{m.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-bold">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <Button onClick={handleNext} disabled={selectedCities.length === 0} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 group">
                                {isMongolian ? "Дараах" : "Next"}
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
                            <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Хаана байрлах вэ?" : "Where to stay?"}</h2>
                            <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {cityRoute.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => {
                                            setActiveCityTab(c.name);
                                            fetchDiscoveryData('hotel', c.name);
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-2xl font-bold text-xs transition-all whitespace-nowrap border-2",
                                            activeCityTab === c.name
                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                                                : "bg-white border-slate-50 text-slate-400 hover:border-slate-100"
                                        )}
                                    >
                                        {c.name} {selectedHotels[c.name] && "✅"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">{isMongolian ? "Зэрэглэл" : "Stars"}</label>
                                <Select value={hotelStars} onValueChange={setHotelStars}>
                                    <SelectTrigger className="h-10 rounded-xl bg-white border-none shadow-sm text-xs font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{isMongolian ? "Бүгд" : "All"}</SelectItem>
                                        <SelectItem value="3">3+ ★</SelectItem>
                                        <SelectItem value="4">4+ ★</SelectItem>
                                        <SelectItem value="5">5 ★</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-3 flex items-end">
                                <Button onClick={() => fetchDiscoveryData('hotel', activeCityTab)} variant="outline" className="w-full h-10 rounded-xl border-emerald-100 text-emerald-600 font-bold text-xs hover:bg-emerald-50 gap-2">
                                    <Search className="w-3.5 h-3.5" />
                                    {isMongolian ? "Хайх" : "Search"}
                                </Button>
                            </div>
                        </div>

                        {isDiscoveryLoading ? (
                            <div className="py-20 text-center space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{isMongolian ? "Ачаалж байна..." : "Loading..."}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hotels.map((hotel: any) => (
                                    <Card
                                        key={hotel.id}
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative",
                                            selectedHotels[activeCityTab]?.id === hotel.id ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-emerald-200"
                                        )}
                                        onClick={() => setSelectedHotels(prev => ({ ...prev, [activeCityTab]: hotel }))}
                                    >
                                        {selectedHotels[activeCityTab]?.id === hotel.id && (
                                            <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white p-1 rounded-full shadow-lg border-2 border-white"><Check className="w-4 h-4" /></div>
                                        )}
                                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                            <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { (e.target as any).src = `https://loremflickr.com/800/600/hotel,${encodeURIComponent(hotel.name.split(' ')[0])}`; }} />
                                            <Badge className="absolute top-3 right-3 bg-white/90 text-emerald-600 font-black border-none shadow-sm">{hotel.price}</Badge>
                                        </div>
                                        <div className="p-4 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-900 text-sm">{hotel.name}</h4>
                                                <div className="flex items-center gap-1 text-amber-500"><Sparkles className="w-3 h-3 fill-current" /><span className="text-xs font-bold">{hotel.rating}</span></div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 line-clamp-2">{hotel.description}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-bold">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <Button onClick={handleNext} disabled={isDiscoveryLoading} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 group">
                                {isMongolian ? "Үргэлжлүүлэх" : "Continue"}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Юу хийх вэ?" : "What to do?"}</h2>
                            <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {cityRoute.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => {
                                            setActiveCityTab(c.name);
                                            fetchDiscoveryData('attraction', c.name);
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-2xl font-bold text-xs transition-all whitespace-nowrap border-2",
                                            activeCityTab === c.name
                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                                                : "bg-white border-slate-50 text-slate-400 hover:border-slate-100"
                                        )}
                                    >
                                        {c.name} {selectedActivities.filter(a => a.cityName === c.name).length > 0 && "✅"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {[
                                { id: 'attraction' as const, icon: Camera, label: isMongolian ? 'Үзвэр' : 'Attractions' },
                                { id: 'shopping' as const, icon: ShoppingBag, label: isMongolian ? 'Шопинг' : 'Shopping' },
                                { id: 'medical' as const, icon: Stethoscope, label: isMongolian ? 'Эмчилгээ' : 'Medical' },
                                { id: 'dining' as const, icon: Utensils, label: isMongolian ? 'Хоол' : 'Dining' },
                                { id: 'education' as const, icon: GraduationCap, label: isMongolian ? 'Боловсрол' : 'Education' },
                            ].map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeCategory === cat.id;
                                return (
                                    <Button
                                        key={cat.id}
                                        variant={isActive ? "default" : "outline"}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            fetchDiscoveryData(cat.id, activeCityTab);
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
                            <div className="py-20 text-center space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{isMongolian ? "Хайж байна..." : "Searching..."}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(activitiesByCategory[activeCategory] || []).map((activity: any) => (
                                    <Card
                                        key={activity.id}
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative",
                                            selectedActivities.some(a => a.id === activity.id) ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-emerald-200"
                                        )}
                                        onClick={() => toggleActivity(activity)}
                                    >
                                        <div className="p-4 flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative">
                                                <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = `https://loremflickr.com/200/200/travel,${encodeURIComponent(activity.name.split(' ')[0])}`; }} />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{activity.name}</h4>
                                                    {selectedActivities.some(a => a.id === activity.id) && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                                </div>
                                                <p className="text-[10px] text-slate-500 line-clamp-2">{activity.description}</p>
                                                <div className="flex items-center gap-1 text-[9px] text-slate-400"><MapPin className="w-3 h-3" /><span className="truncate">{activity.address}</span></div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-bold">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <Button onClick={handleFinalize} disabled={isDiscoveryLoading} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200 group">
                                {isMongolian ? "Төлөвлөгөө гаргах" : "Generate Plan"}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div
                        key="step5"
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
                                    <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Төлөвлөгөө боловсруулж байна..." : "Generating..."}</h2>
                                    <p className="text-slate-500 animate-pulse">{isMongolian ? "Таны аяллыг боловсруулж байна..." : "Crafting your journey..."}</p>
                                </div>
                            </div>
                        ) : itinerary ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="p-6 rounded-3xl border-slate-100 shadow-sm flex justify-between items-end">
                                        <div>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-none mb-2">{itinerary.city || destination} • {itinerary.duration} {isMongolian ? "хоног" : "days"}</Badge>
                                            <h1 className="text-3xl font-black text-slate-900">{isMongolian ? "Аяллын Маршрут" : "Travel Itinerary"}</h1>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{isMongolian ? "Нийт төсөв" : "Total Budget"}</p>
                                            <p className="text-xl font-black text-emerald-600">{itinerary.totalBudget}</p>
                                        </div>
                                    </Card>

                                    {itinerary.days?.map((day: any) => (
                                        <Card key={day.day} className="overflow-hidden border-slate-100 shadow-sm rounded-3xl">
                                            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black">{day.day}</div>
                                                <h3 className="font-bold text-slate-900">{day.title}</h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {day.activities.map((act: any, idx: number) => (
                                                    <div key={idx} className="relative pl-8 group last:pb-0 pb-6 border-l-2 border-slate-100 ml-3">
                                                        <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-emerald-500" />
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-black text-emerald-600">{act.time}</span>
                                                                <Badge variant="outline" className="text-[10px] border-slate-100 bg-white font-black text-slate-500">{act.cost}</Badge>
                                                            </div>
                                                            <h4 className="font-bold text-slate-900">{act.activity}</h4>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="w-3 h-3" /><span>{act.location}</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    <Card className="p-4 rounded-3xl border-slate-100 shadow-sm h-64 overflow-hidden relative">
                                        <ItineraryMap activities={itinerary.days?.flatMap((d: any) => d.activities.map((a: any) => ({ ...a, day: d.day, title: a.activity }))) || []} />
                                    </Card>

                                    {itinerary.visaRequirement && (
                                        <Card className="p-6 rounded-3xl bg-blue-50 border-blue-100 space-y-2">
                                            <h3 className="font-black text-lg flex items-center gap-2 text-blue-900"><Search className="w-5 h-5" />{isMongolian ? "Визний мэдээлэл" : "Visa Info"}</h3>
                                            <Badge className={cn("font-black border-none", itinerary.visaRequirement.needed ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>{itinerary.visaRequirement.needed ? (isMongolian ? "Визтэй" : "Visa Required") : (isMongolian ? "Визгүй" : "Visa-Free")}</Badge>
                                            <p className="text-xs text-blue-700 font-medium">{itinerary.visaRequirement.details}</p>
                                        </Card>
                                    )}

                                    <Card className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
                                        <h3 className="font-black text-lg flex items-center gap-2"><Smartphone className="w-5 h-5 text-emerald-400" />GateSIM eSIM</h3>
                                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                            <p className="text-xs font-bold text-emerald-400 uppercase mb-1">{itinerary.esimRecommendation || "Travel Package"}</p>
                                            <Button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 font-black">Buy Now</Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <p className="text-slate-500">{isMongolian ? "Алдаа гарлаа." : "Error occurred."}</p>
                                <Button onClick={handleFinalize}>Retry</Button>
                            </div>
                        )}

                        <div className="flex justify-between pt-8 border-t border-slate-100">
                            <Button variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-bold"><ArrowLeft className="w-5 h-5 mr-2" />{isMongolian ? "Буцах" : "Back"}</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" className="h-14 w-14 rounded-2xl"><Share2 className="w-5 h-5 text-slate-400" /></Button>
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black"><Download className="w-5 h-5 mr-2" />{isMongolian ? "Хадгалах" : "Save"}</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
