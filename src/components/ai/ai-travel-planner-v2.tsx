"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
    Minus,
    Briefcase,
    Palmtree,
    Mountain,
    Users,
    Heart,
    Landmark,
    Ticket,
    Package,
    Wallet,
    Bed,
    User,
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
    "AU": [
        { name: "Сидней", nameEn: "Sydney" },
        { name: "Мельбурн", nameEn: "Melbourne" },
        { name: "Брисбэн", nameEn: "Brisbane" },
        { name: "Перт", nameEn: "Perth" },
        { name: "Голд Кост", nameEn: "Gold Coast" },
    ],
    "GB": [
        { name: "Лондон", nameEn: "London" },
        { name: "Манчестер", nameEn: "Manchester" },
        { name: "Эдинбург", nameEn: "Edinburgh" },
        { name: "Ливерпүүл", nameEn: "Liverpool" },
        { name: "Бирмингем", nameEn: "Birmingham" },
    ],
    "FR": [
        { name: "Парис", nameEn: "Paris" },
        { name: "Ницца", nameEn: "Nice" },
        { name: "Лион", nameEn: "Lyon" },
        { name: "Марсель", nameEn: "Marseille" },
        { name: "Бордо", nameEn: "Bordeaux" },
    ],
    "DE": [
        { name: "Берлин", nameEn: "Berlin" },
        { name: "Мюнхен", nameEn: "Munich" },
        { name: "Франкфурт", nameEn: "Frankfurt" },
        { name: "Гамбург", nameEn: "Hamburg" },
        { name: "Кёльн", nameEn: "Cologne" },
    ],
    "IT": [
        { name: "Ром", nameEn: "Rome" },
        { name: "Милан", nameEn: "Milan" },
        { name: "Венец", nameEn: "Venice" },
        { name: "Флоренц", nameEn: "Florence" },
        { name: "Неаполь", nameEn: "Naples" },
    ],
    "ES": [
        { name: "Барселона", nameEn: "Barcelona" },
        { name: "Мадрид", nameEn: "Madrid" },
        { name: "Севилья", nameEn: "Seville" },
        { name: "Валенси", nameEn: "Valencia" },
        { name: "Ибиза", nameEn: "Ibiza" },
    ],
    "RU": [
        { name: "Москва", nameEn: "Moscow" },
        { name: "Санкт-Петербург", nameEn: "Saint Petersburg" },
        { name: "Казань", nameEn: "Kazan" },
        { name: "Екатеринбург", nameEn: "Yekaterinburg" },
        { name: "Сочи", nameEn: "Sochi" },
        { name: "Иркутск", nameEn: "Irkutsk" },
    ],
    "TR": [
        { name: "Истанбул", nameEn: "Istanbul" },
        { name: "Анталья", nameEn: "Antalya" },
        { name: "Каппадоки", nameEn: "Cappadocia" },
        { name: "Бодрум", nameEn: "Bodrum" },
        { name: "Измир", nameEn: "Izmir" },
    ],
    "AE": [
        { name: "Дубай", nameEn: "Dubai" },
        { name: "Абу Даби", nameEn: "Abu Dhabi" },
        { name: "Шаржа", nameEn: "Sharjah" },
    ],
    "CA": [
        { name: "Торонто", nameEn: "Toronto" },
        { name: "Ванкувер", nameEn: "Vancouver" },
        { name: "Монреаль", nameEn: "Montreal" },
        { name: "Калгари", nameEn: "Calgary" },
    ],
};

const tripPurposes = [
    { id: 'tourist', icon: Backpack, label: { mn: 'Жуулчлал', en: 'Tourism' }, desc: { mn: 'Ерөнхий үзвэрүүд, алдартай газрууд', en: 'General sightseeing and popular attractions' } },
    { id: 'relaxation', icon: Palmtree, label: { mn: 'Амралт', en: 'Relaxation' }, desc: { mn: 'Алжаал тайлах, спа, сувилал', en: 'Leisure, spa, and wellness' } },
    { id: 'adventure', icon: Mountain, label: { mn: 'Адал явдал', en: 'Adventure' }, desc: { mn: 'Экстрим спорт, идэвхтэй хөдөлгөөн', en: 'Active sports and thrilling activities' } },
    { id: 'family', icon: Users, label: { mn: 'Гэр бүл', en: 'Family' }, desc: { mn: 'Хүүхдэд ээлтэй, аюулгүй газрууд', en: 'Safe and fun spots for kids and adults' } },
    { id: 'romantic', icon: Heart, label: { mn: 'Романтик', en: 'Romantic' }, desc: { mn: 'Хосуудад зориулсан тусгай газрууд', en: 'Special spots for couples and honeymoons' } },
    { id: 'culture', icon: Landmark, label: { mn: 'Соёл', en: 'Culture' }, desc: { mn: 'Музей, түүхэн дурсгалт газрууд', en: 'History, museums and local heritage' } },
    { id: 'shopping', icon: Package, label: { mn: 'Шопинг', en: 'Shopping' }, desc: { mn: 'Худалдааны төвүүд, захууд', en: 'Malls, markets and boutiques' } },
    { id: 'foodie', icon: Sparkles, label: { mn: 'Хоол аялал', en: 'Foodie' }, desc: { mn: 'Ресторан, хоолны туршлагууд', en: 'Fine dining and local specialties' } },
    { id: 'procurement', icon: Package, label: { mn: 'Бараа таталт', en: 'Procurement' }, desc: { mn: 'Бөөний төвүүд, бараа бэлтгэл, үйлдвэр', en: 'Wholesale markets, sourcing, and factories' } },
    { id: 'business', icon: Briefcase, label: { mn: 'Бизнес', en: 'Business' }, desc: { mn: 'Уулзалт, ажил хэргийн хэрэгцээ', en: 'Work-related and professional events' } },
    { id: 'medical', icon: Stethoscope, label: { mn: 'Эмчилгээ', en: 'Medical' }, desc: { mn: 'Эрүүл мэнд, оношилгоо, сувилгаа', en: 'Check-ups, treatments and recovery' } },
    { id: 'education', icon: GraduationCap, label: { mn: 'Боловсрол', en: 'Education' }, desc: { mn: 'Сургууль, сургалт, сургалтын аялал', en: 'Schools, courses and study tours' } },
    { id: 'event', icon: Ticket, label: { mn: 'Арга хэмжээ', en: 'Event' }, desc: { mn: 'Концерт, наадам, фестиваль', en: 'Festivals, concerts and exhibitions' } },
];

const PURPOSE_TO_CATEGORY: Record<string, string> = {
    tourist: 'attraction',
    relaxation: 'attraction',
    adventure: 'attraction',
    family: 'attraction',
    romantic: 'attraction',
    culture: 'attraction',
    shopping: 'shopping',
    foodie: 'dining',
    procurement: 'shopping',
    business: 'shopping',
    medical: 'medical',
    education: 'education',
    event: 'attraction',
};

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
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [chinaDistance, setChinaDistance] = useState<string[]>(["mid"]); // Default for China: Mid (Beijing/Tianjin)
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [city, setCity] = useState(""); // Current selection in dropdown
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [cityRoute, setCityRoute] = useState<{ name: string, days: number }[]>([]);
    const [activeCityTab, setActiveCityTab] = useState("");
    const [customCityInput, setCustomCityInput] = useState("");
    const [intlTransport, setIntlTransport] = useState("flight");
    const [interCityTransport, setInterCityTransport] = useState("highspeed_train");
    const [innerCityTransport, setInnerCityTransport] = useState("public");
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
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [isSavingTrip, setIsSavingTrip] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);

    // --- Hotel Filters ---
    const [hotelStars, setHotelStars] = useState("all");
    const [hotelArea, setHotelArea] = useState("all");

    const isMongolian = language === "mn";

    const loadingMessages = isMongolian ? [
        "Аяллын мэдээллийг боловсруулж байна...",
        "Хамгийн тохиромжтой нислэгүүдийг хайж байна...",
        "Зочид буудал болон байршлуудыг шалгаж байна...",
        "Таны төгс аяллын хөтөлбөрийг эцэслэн гаргаж байна..."
    ] : [
        "Analyzing travel preferences...",
        "Finding the best routes and flights...",
        "Curating top-rated hotels and spots...",
        "Finalizing your perfect itinerary..."
    ];

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

    // --- Initialize from URL Params (Wizard integration) ---
    const searchParams = useSearchParams();

    useEffect(() => {
        const destParam = searchParams.get("destination");
        const durParam = searchParams.get("duration");
        const purpParam = searchParams.get("purpose");

        if (destParam) setDestination(destParam);
        if (durParam) setDuration(parseInt(durParam) || 5);
        if (purpParam) setPurposes([purpParam]);

        // If we have params, skip to city selection (Step 3)
        if (destParam && durParam && purpParam) {
            setStep(3);
        }
    }, [searchParams]);

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

    // --- Premium UX: Scroll to Top on Step/City transitions ---
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step, activeCityTab]);

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

            const lastCity = cityRoute.length > 0 ? cityRoute[cityRoute.length - 1].name : "Ulaanbaatar";

            const res = await fetch("/api/ai/suggest-cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    purposes: purposes.join(", "),
                    details: combinedDetails,
                    currentCity: lastCity,
                    chinaDistance: destination === 'CN' ? chinaDistance : undefined,
                    intlTransport,
                    travelers: { adults, children }
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

    // --- Loading Phase Effect ---
    useEffect(() => {
        if (isGenerating) {
            setLoadingPhase(0);
            const interval = setInterval(() => {
                setLoadingPhase(p => (p + 1) % 4);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isGenerating]);

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
                    purposeDetails,
                    travelers: { adults, children }
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
                        [type]: data.options.map((opt: any) => ({ ...opt, cityName: targetCity }))
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
        setStep(6);
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
                    intlTransport,
                    interCityTransport,
                    innerCityTransport,
                    selectedHotels,
                    selectedActivities,
                    travelers: { adults, children }
                }),
            });
            const data = await res.json();
            if (data.itinerary) {
                setItinerary(data.itinerary);
            }
        } catch (error) {
            console.error("Finalization failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleActivitiesContinue = () => {
        const currentCityIndex = cityRoute.findIndex(c => c.name === activeCityTab);

        // 1. Validation: Use selectedActivities to check if any activity for current city is selected
        const hasActivities = selectedActivities.some(a => a.cityName === activeCityTab);
        if (!hasActivities) {
            alert(isMongolian
                ? `${activeCityTab} хотын үзэх зүйлсээс сонгоно уу`
                : `Please select some activities for ${activeCityTab}`);
            return;
        }

        // 2. Navigation: If there's a next city, move to it within Step 4
        if (currentCityIndex < cityRoute.length - 1) {
            const nextCity = cityRoute[currentCityIndex + 1].name;
            setActiveCityTab(nextCity);

            // Fetch activities for the next city (keep current category for consistency)
            fetchDiscoveryData(activeCategory, nextCity);
            return; // stay in Step 4
        }

        // 3. Finalization: Last city reached
        handleFinalize();
    };

    const handleNext = () => {
        if (step === 1) {
            if (!destination) {
                alert(isMongolian ? "Destination сонгоно уу" : "Please select a destination");
                return;
            }
        }
        if (step === 2) {
            if (purposes.length === 0) {
                alert(isMongolian ? "Аяллын зорилго сонгоно уу" : "Please select at least one purpose");
                return;
            }
        }
        if (step === 3) {
            if (selectedCities.length === 0) {
                alert(isMongolian ? "Хот сонгоно уу" : "Please select at least one city");
                return;
            }
            const firstCity = cityRoute[0]?.name || "";
            setActiveCityTab(firstCity);
            fetchDiscoveryData('hotel', firstCity);
        }
        if (step === 4) {
            // Smart navigation for multi-city hotel selection
            const currentCityIndex = cityRoute.findIndex(c => c.name === activeCityTab);

            // 1. Ensure current city has a selection
            if (!selectedHotels[activeCityTab]) {
                alert(isMongolian
                    ? `${activeCityTab} хотын буудлаа сонгоно уу`
                    : `Please select a hotel for ${activeCityTab}`);
                return;
            }

            // 2. If there's a next city, move to it within Step 4
            if (currentCityIndex < cityRoute.length - 1) {
                const nextCity = cityRoute[currentCityIndex + 1].name;
                setActiveCityTab(nextCity);
                fetchDiscoveryData('hotel', nextCity);
                return; // Stay in Step 4
            }

            // 3. Last city reached, ensure all are selected (just in case they skipped via tabs)
            const unselectedCities = cityRoute.filter(c => !selectedHotels[c.name]);
            if (unselectedCities.length > 0) {
                const firstUnselected = unselectedCities[0].name;
                setActiveCityTab(firstUnselected);
                fetchDiscoveryData('hotel', firstUnselected);
                alert(isMongolian
                    ? `Үргэлжлүүлэхийн өмнө бүх хотын буудлаа сонгоно уу`
                    : `Please select a hotel for all cities before continuing`);
                return;
            }

            // All good, proceed to Step 5
            const firstCity = cityRoute[0]?.name || "";
            setActiveCityTab(firstCity);

            // Smart category selection based on purposes
            const relevantCategories = purposes
                .map(p => PURPOSE_TO_CATEGORY[p])
                .filter(Boolean);
            const bestCategory = (relevantCategories[0] || 'attraction') as any;
            setActiveCategory(bestCategory);

            fetchDiscoveryData(bestCategory, firstCity);
        }
        setStep(prev => prev + 1);
    };

    const handleSkipStep4 = () => {
        // Skip hotel selection and go to activities
        const firstCity = cityRoute[0]?.name || "";
        setActiveCityTab(firstCity);
        const relevantCategories = purposes
            .map(p => PURPOSE_TO_CATEGORY[p])
            .filter(Boolean);
        const bestCategory = (relevantCategories[0] || 'attraction') as any;
        setActiveCategory(bestCategory);
        fetchDiscoveryData(bestCategory, firstCity);
        setStep(5);
    };

    const handleSaveTrip = async () => {
        if (!session) {
            alert(isMongolian ? "Төлөвлөгөөг хадгалахын тулд нэвтэрнэ үү" : "Please login to save your trip");
            return;
        }
        if (!itinerary) return;

        setIsSavingTrip(true);
        try {
            const res = await fetch("/api/trips/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    destination,
                    duration,
                    purpose: purposes.join(", "),
                    budget,
                    itinerary,
                    userId: (session.user as any).id
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert(isMongolian ? "Амжилттай хадгалагдлаа! Та өөрийн профайлаас үзэх боломжтой." : "Successfully saved! You can view it in your profile.");
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Save failed:", error);
            alert(isMongolian ? "Хадгалахад алдаа гарлаа." : "Failed to save trip.");
        } finally {
            setIsSavingTrip(false);
        }
    };

    const handleDownloadPDF = () => {
        console.log("Download PDF clicked");
        // Simple and robust: browser print
        try {
            window.print();
        } catch (e) {
            console.error("Print failed:", e);
            alert(isMongolian ? "Хэвлэх боломжгүй байна. Та дэлгэцийн зураг авна уу." : "Printing is not supported on this device. Please take a screenshot.");
        }
    };

    const handleShare = async () => {
        console.log("Share clicked");
        const shareData = {
            title: isMongolian ? "Аяллын Төлөвлөгөө" : "Travel Itinerary",
            text: isMongolian ? `Миний ${destination} руу хийх аяллын төлөвлөгөөг үзээрэй!` : `Check out my travel plan for ${destination}!`,
            url: window.location.href,
        };

        try {
            // First try native share
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                throw new Error("Native share not available");
            }
        } catch (err) {
            console.log("Native share failed/unavailable, falling back to clipboard:", err);
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert(isMongolian ? "Холбоос хуулагдлаа!" : "Link copied to clipboard!");
            } catch (clipboardErr) {
                console.error("Clipboard failed:", clipboardErr);
                alert(isMongolian ? "Хуваалцах боломжгүй байна. Дэлгэцийн зураг авна уу." : "Unable to share. Please take a screenshot.");
            }
        }
    };

    const handleSkipStep5 = () => {
        // Skip activity selection and generate plan
        handleFinalize();
    };

    const handleBack = () => {
        if (step === 4) {
            const currentCityIndex = cityRoute.findIndex(c => c.name === activeCityTab);
            if (currentCityIndex > 0) {
                const prevCity = cityRoute[currentCityIndex - 1].name;
                setActiveCityTab(prevCity);
                fetchDiscoveryData('hotel', prevCity);
                return;
            }
        }
        if (step === 5) {
            const currentCityIndex = cityRoute.findIndex(c => c.name === activeCityTab);
            if (currentCityIndex > 0) {
                const prevCity = cityRoute[currentCityIndex - 1].name;
                setActiveCityTab(prevCity);
                fetchDiscoveryData(activeCategory, prevCity);
                return;
            }
        }
        setStep(prev => prev - 1);
    };

    // --- Components for Steps ---

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0.5 mb-10 px-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="flex items-center">
                    <div
                        className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0",
                            step === num ? "bg-emerald-600 text-white scale-110 shadow-md" :
                                step > num ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                        )}
                    >
                        {step > num ? <Check className="w-3 h-3" /> : num}
                    </div>
                    {num < 6 && (
                        <div className={cn(
                            "w-4 sm:w-8 h-1 rounded-full shrink-0",
                            step > num ? "bg-emerald-200" : "bg-slate-100"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
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
                    <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 whitespace-nowrap">
                        <Sparkles className="w-5 h-5 sm:w-6 h-6 text-emerald-500 shrink-0" />
                        <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 bg-clip-text text-transparent">
                            {isMongolian ? "Gate Аялал Төлөвлөгч" : "Gate Travel Planner"}
                        </span>
                    </h1>
                    <p className="text-slate-500 text-[10px] sm:text-sm">
                        {isMongolian ? "Дээд зэрэглэлийн нарийвчлалтай төлөвлөлт" : "Professional-grade precision planning"}
                    </p>
                </div>
            </div>

            <StepIndicator />

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Төлөвлөгөө эхлүүлэх" : "Start Planning"}</h2>
                            <p className="text-slate-500">{isMongolian ? "Үндсэн мэдээллээ оруулна уу" : "Enter your core trip details"}</p>
                        </div>

                        {/* Destination & Date Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Destination Selection */}
                            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Очих улс" : "Destination"}</label>
                                <Select value={destination} onValueChange={(val) => {
                                    setDestination(val);
                                }}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                                        <SelectValue placeholder={isMongolian ? "Улс сонгоно уу" : "Select Country"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinations.map((d) => (
                                            <SelectItem key={d.code} value={d.code}>
                                                <div className="flex items-center gap-2">
                                                    <span>{d.flag}</span>
                                                    <span>{isMongolian ? d.name : d.nameEn}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Card>

                            {/* Date Picker */}
                            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Аялах огноо" : "Travel Date"}</label>
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
                            </Card>
                        </div>

                        {/* Duration & China Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Хонох өдөр" : "Duration"}</label>
                                <div className="space-y-8 py-4 px-2">
                                    <div className="relative flex items-center group touch-none">
                                        {/* Progressive Background Track */}
                                        <div className="absolute inset-x-0 h-2 bg-slate-100 rounded-full" />
                                        <div
                                            className="absolute h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-150"
                                            style={{
                                                width: `${((duration - 1) / 29) * 100}%`
                                            }}
                                        />

                                        {/* The Actual Range Input */}
                                        <input
                                            type="range"
                                            min="1"
                                            max="30"
                                            step="1"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer z-20"
                                        />

                                        {/* Visual Thumb */}
                                        <div
                                            className="absolute w-8 h-8 bg-white border-2 border-emerald-500 rounded-full shadow-xl pointer-events-none transition-all duration-150 transform -translate-y-1/2 top-1/2 flex items-center justify-center z-10"
                                            style={{
                                                left: `calc(${((duration - 1) / 29) * 100}% - 16px)`
                                            }}
                                        >
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Labels & Numeric Display */}
                                    <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isMongolian ? "Нийт хоног" : "Duration"}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{duration}</span>
                                                <span className="text-sm font-bold text-slate-400">{isMongolian ? "хоног" : "days"}</span>
                                            </div>
                                        </div>

                                        {/* Quick Toggles */}
                                        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 text-slate-400 hover:text-emerald-600"
                                                onClick={() => setDuration(Math.max(1, duration - 1))}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <div className="w-px h-6 bg-slate-100 self-center" />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 text-slate-400 hover:text-emerald-600"
                                                onClick={() => setDuration(Math.min(30, duration + 1))}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* China Distance - ONLY for CN */}
                            {destination === 'CN' && (
                                <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-4 border-l-4 border-l-emerald-500 bg-emerald-50/20">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-emerald-500" />
                                        {isMongolian ? "Хилээс очих зай" : "Distance from Border"}
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'near', label: { mn: 'Ойр', en: 'Near' }, desc: { mn: 'Эрээн, Хөх хот...', en: 'Erenhot, Hohhot...' } },
                                            { id: 'mid', label: { mn: 'Дунд', en: 'Mid' }, desc: { mn: 'Бээжин, Тяньжин...', en: 'Beijing, Tianjin...' } },
                                            { id: 'far', label: { mn: 'Хол', en: 'Far' }, desc: { mn: 'Шанхай, Гуанжу...', en: 'Shanghai, Guangzhou...' } }
                                        ].map((d) => {
                                            const isSelected = chinaDistance.includes(d.id);
                                            return (
                                                <button
                                                    key={d.id}
                                                    onClick={() => {
                                                        setChinaDistance(prev =>
                                                            prev.includes(d.id)
                                                                ? (prev.length > 1 ? prev.filter(id => id !== d.id) : prev)
                                                                : [...prev, d.id]
                                                        );
                                                    }}
                                                    className={cn(
                                                        "p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 relative overflow-hidden",
                                                        isSelected
                                                            ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105"
                                                            : "border-slate-50 bg-white text-slate-400 hover:border-emerald-200"
                                                    )}
                                                >
                                                    <span className="text-xs font-black">{isMongolian ? d.label.mn : d.label.en}</span>
                                                    <span className={cn(
                                                        "text-[8px] font-medium text-center leading-tight",
                                                        isSelected ? "text-emerald-50" : "opacity-60"
                                                    )}>
                                                        {isMongolian ? d.desc.mn : d.desc.en}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-medium px-1">
                                        {isMongolian ? "* Сонголт бүрд тохирсон хотууд санал болгоно" : "* Cities will be suggested based on your choices"}
                                    </p>
                                </Card>
                            )}
                        </div>

                        {/* Travelers Card */}
                        <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Аялагчид" : "Travelers"}</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-400">{isMongolian ? "Том хүн" : "Adults"}</span>
                                                <span className="text-lg font-black text-slate-900">{adults}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600" onClick={() => setAdults(Math.max(1, adults - 1))}><Minus className="w-3 h-3" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600" onClick={() => setAdults(Math.min(10, adults + 1))}><Plus className="w-3 h-3" /></Button>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-400">{isMongolian ? "Хүүхэд" : "Children"}</span>
                                                <span className="text-lg font-black text-slate-900">{children}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600" onClick={() => setChildren(Math.max(0, children - 1))}><Minus className="w-3 h-3" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600" onClick={() => setChildren(Math.min(10, children + 1))}><Plus className="w-3 h-3" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium px-1">
                                        {isMongolian ? "* Зардлын тооцоололд аялагчдын тоо шууд нөлөөлнө" : "* Budget will be calculated based on the number of travelers"}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Button onClick={handleNext} className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-black text-white text-base sm:text-lg font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3">
                            {isMongolian ? "Үргэлжлүүлэх" : "Continue"}
                            <ArrowRight className="w-5 h-5 sm:w-6 h-6" />
                        </Button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Аяллын зорилго ба тээвэр" : "Trip Intent & Transport"}</h2>
                            <p className="text-slate-500">{isMongolian ? "Аяллын зорилгоо тодорхойлж, тээврийн хэрэгслээ сонгоно уу" : "Define your trip purposes and select transport options"}</p>
                        </div>

                        <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Аяллын зорилго" : "Trip Purposes"}</label>
                            <div className="grid grid-cols-2 gap-3 pb-2 transition-all">
                                {tripPurposes.map((p) => {
                                    const Icon = p.icon;
                                    const isSelected = purposes.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setPurposes(prev =>
                                                    prev.includes(p.id)
                                                        ? (prev.length > 1 ? prev.filter(id => id !== p.id) : prev)
                                                        : [...prev, p.id]
                                                );
                                            }}
                                            className={cn(
                                                "w-full p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center group h-full",
                                                isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-50/50" : "border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                                                isSelected ? "bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className={cn("text-[10px] sm:text-xs font-black transition-colors leading-tight", isSelected ? "text-emerald-700" : "text-slate-600 uppercase tracking-wide")}>
                                                    {isMongolian ? p.label.mn : p.label.en}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Detatched Detail Textareas */}
                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {purposes.map((id) => {
                                        const p = tripPurposes.find(x => x.id === id);
                                        if (!p) return null;
                                        return (
                                            <motion.div
                                                key={id}
                                                initial={{ opacity: 0, y: 10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                                exit={{ opacity: 0, y: 10, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-2 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
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
                                                        className="min-h-[70px] bg-white/80 border-none rounded-xl text-[11px] font-medium placeholder:text-slate-300 focus-visible:ring-emerald-500 resize-none shadow-sm"
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </Card>

                        {/* Granular Transport Selection */}
                        <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{isMongolian ? "Тээврийн сонголт" : "Transport Selection"}</label>
                                <p className="text-[10px] text-slate-400 font-medium">{isMongolian ? "* Таны аяллын төлөвлөгөө эдгээр сонголтуудад тулгуурлан боловсрогдоно" : "* Your itinerary will be tailored based on these choices"}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {/* International */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{isMongolian ? "Улс хооронд" : "International"}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pb-1">
                                        {[
                                            { id: 'flight', icon: Plane, label: { mn: 'Онгоц', en: 'Flight' } },
                                            { id: 'train', icon: TrainFront, label: { mn: 'Галт тэрэг', en: 'Train' } },
                                            { id: 'bus', icon: Bus, label: { mn: 'Автобус', en: 'Bus' } },
                                        ].map((t) => {
                                            const Icon = t.icon;
                                            const isActive = intlTransport === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setIntlTransport(t.id)}
                                                    className={cn(
                                                        "px-2 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 justify-center",
                                                        isActive ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm" : "border-slate-50 text-slate-400 hover:border-slate-100 bg-white"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black tracking-tight">{isMongolian ? t.label.mn : t.label.en}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Inter-city */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{isMongolian ? "Хот хооронд" : "Inter-city"}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pb-1">
                                        {[
                                            { id: 'highspeed_train', icon: TrainFront, label: { mn: 'Хурдны галт тэрэг', en: 'High-speed' } },
                                            { id: 'car', icon: Car, label: { mn: 'Машин', en: 'Private Car' } },
                                            { id: 'flight', icon: Plane, label: { mn: 'Нислэг', en: 'Flight' } },
                                        ].map((t) => {
                                            const Icon = t.icon;
                                            const isActive = interCityTransport === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setInterCityTransport(t.id)}
                                                    className={cn(
                                                        "px-2 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 justify-center",
                                                        isActive ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm" : "border-slate-50 text-slate-400 hover:border-slate-100 bg-white"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black tracking-tight text-center leading-tight">{isMongolian ? t.label.mn : t.label.en}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Inner-city */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{isMongolian ? "Хот дотор" : "Inner-city"}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 pb-1">
                                        {[
                                            { id: 'public', icon: Bus, label: { mn: 'Нийтийн тээвэр', en: 'Public' } },
                                            { id: 'taxi', icon: Car, label: { mn: 'Такси', en: 'Taxi' } },
                                            { id: 'private_car', icon: Car, label: { mn: 'Хувийн машин', en: 'Private' } },
                                        ].map((t) => {
                                            const Icon = t.icon;
                                            const isActive = innerCityTransport === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setInnerCityTransport(t.id)}
                                                    className={cn(
                                                        "px-2 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 justify-center",
                                                        isActive ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm" : "border-slate-50 text-slate-400 hover:border-slate-100 bg-white"
                                                    )}
                                                >
                                                    <Icon className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black tracking-tight text-center leading-tight">{isMongolian ? t.label.mn : t.label.en}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Button onClick={handleNext} className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-black text-white text-base sm:text-lg font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3">
                            {isMongolian ? "Үргэлжлүүлэх" : "Continue"}
                            <ArrowRight className="w-5 h-5 sm:w-6 h-6" />
                        </Button>
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
                                                <div className="flex gap-2 pb-1">
                                                    {[1, 2, 3].map(i => <div key={i} className="h-20 w-full bg-slate-50 animate-pulse rounded-2xl shrink-0 border border-slate-100" />)}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {suggestedCities.map((c) => {
                                                        const isSelected = selectedCities.includes(c.name);
                                                        return (
                                                            <button
                                                                key={c.name}
                                                                onClick={() => isSelected ? removeCity(c.name) : addCity(c.name)}
                                                                className={cn(
                                                                    "group text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                                                                    isSelected
                                                                        ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100"
                                                                        : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                                                                )}
                                                            >
                                                                <div className={cn("transition-all relative z-10", isSelected ? "opacity-100" : "opacity-100")}>
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-black text-slate-900 leading-none mb-1">{isMongolian ? c.nameMn : c.name}</span>
                                                                            {c.distance && (
                                                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full w-fit">
                                                                                    {c.distance}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className={cn(
                                                                            "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                                                            isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-500"
                                                                        )}>
                                                                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                                        {c.reason}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
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

                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center gap-2 px-1 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                {isMongolian ? "Аяллын дараалал" : "Trip Sequence"}
                                            </span>
                                        </div>
                                        <div className="space-y-6">
                                            {cityRoute.map((c, idx) => (
                                                <motion.div
                                                    key={c.name}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="relative pl-12"
                                                >
                                                    {idx < cityRoute.length - 1 && (
                                                        <div className="absolute left-[19px] top-10 bottom-[-32px] w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-100" />
                                                    )}
                                                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110">
                                                        <span className="text-xs font-black text-emerald-600">{idx + 1}</span>
                                                    </div>

                                                    {/* Route Step Label */}
                                                    <div className="absolute -left-1 top-12 flex flex-col items-center gap-1 opacity-40">
                                                        {idx === 0 ? (
                                                            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter vertical-text">{isMongolian ? "Эхлэл" : "Start"}</span>
                                                        ) : idx === cityRoute.length - 1 ? (
                                                            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter vertical-text">{isMongolian ? "Очих" : "Dest"}</span>
                                                        ) : (
                                                            <div className="w-0.5 h-4 bg-emerald-200" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-emerald-200 hover:bg-white hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                                                        {/* Reordering Controls */}
                                                        <div className="flex flex-col gap-0.5 -ml-1 shrink-0">
                                                            <button
                                                                onClick={() => idx > 0 && reorderCities(idx, idx - 1)}
                                                                disabled={idx === 0}
                                                                className={cn("p-1 hover:bg-emerald-50 rounded-lg transition-all", idx === 0 ? "opacity-5 cursor-not-allowed" : "text-slate-400 hover:text-emerald-600 active:scale-90")}
                                                            >
                                                                <ChevronUp className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => idx < cityRoute.length - 1 && reorderCities(idx, idx + 1)}
                                                                disabled={idx === cityRoute.length - 1}
                                                                className={cn("p-1 hover:bg-emerald-50 rounded-lg transition-all", idx === cityRoute.length - 1 ? "opacity-5 cursor-not-allowed" : "text-slate-400 hover:text-emerald-600 active:scale-90")}
                                                            >
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <h4 className="font-black text-slate-900 leading-tight truncate">{c.name}</h4>
                                                            <Badge variant="outline" className="bg-white text-emerald-600 border-emerald-100 font-bold mt-1 text-[9px] py-0 px-1.5 h-4.5 shrink-0">
                                                                {c.days} {isMongolian ? "хоног" : "days"}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="flex bg-white rounded-xl border border-slate-100 p-0.5 shadow-sm">
                                                                <button onClick={() => updateCityDays(c.name, Math.max(1, c.days - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 font-black transition-colors">-</button>
                                                                <div className="w-7 flex items-center justify-center font-black text-[10px] text-slate-700">{c.days}</div>
                                                                <button onClick={() => updateCityDays(c.name, c.days + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-400 font-black transition-colors">+</button>
                                                            </div>
                                                            <button onClick={() => removeCity(c.name)} className="p-2 hover:bg-red-50 hover:text-red-600 text-slate-200 rounded-xl transition-all active:scale-90"><X className="w-4.5 h-4.5" /></button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
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
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 gap-2">
                            <Button variant="ghost" onClick={handleBack} className="h-14 px-4 sm:px-8 rounded-2xl font-bold shrink-0">
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                                {isMongolian ? "Буцах" : "Back"}
                            </Button>
                            <Button onClick={handleNext} disabled={selectedCities.length === 0} className="h-14 px-5 sm:px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-lg shadow-lg shadow-emerald-200 group flex-1 sm:flex-initial justify-center">
                                {isMongolian ? "Дараах" : "Next"}
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div >
                )
                }
                {
                    step === 4 && (
                        <motion.div
                            key="step4"
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
                                    {/* Custom Choice Card */}
                                    <Card
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]",
                                            selectedHotels[activeCityTab]?.id === 'custom' ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-slate-50/50 hover:border-emerald-200"
                                        )}
                                        onClick={() => setSelectedHotels(prev => ({
                                            ...prev,
                                            [activeCityTab]: {
                                                id: 'custom',
                                                name: isMongolian ? 'Өөрийн сонголт' : 'My own choice',
                                                description: isMongolian ? 'Би энэ хотод өөрийн буудалд байрлана.' : 'I will arrange my own accommodation in this city.',
                                                price: 'N/A',
                                                rating: 5,
                                                imageUrl: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&q=80&w=800'
                                            }
                                        }))}
                                    >
                                        {selectedHotels[activeCityTab]?.id === 'custom' && (
                                            <div className="absolute top-3 left-3 z-10 bg-emerald-600 text-white p-1 rounded-full shadow-lg border-2 border-white"><Check className="w-4 h-4" /></div>
                                        )}
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 text-emerald-600 transition-transform group-hover:scale-110">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <h4 className="font-black text-slate-900 text-lg mb-2">{isMongolian ? 'Өөрийн сонголт' : 'My own choice'}</h4>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {isMongolian ? 'Санал болгосон буудлыг сонгох шаардлагагүй. Би өөрөө буудлаа шийднэ.' : 'No need to pick from suggestions. I will handle my own stay.'}
                                        </p>
                                        <Badge variant="outline" className="mt-4 border-emerald-200 text-emerald-600 bg-white font-black uppercase text-[10px]">
                                            {isMongolian ? 'Уян хатан' : 'Flexible'}
                                        </Badge>
                                    </Card>

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
                                                <Badge className="absolute top-3 right-3 bg-white/95 text-emerald-600 font-black border-none shadow-sm text-sm py-1 px-3 rounded-full backdrop-blur-sm">{hotel.price}</Badge>
                                                {hotel.rating >= 4.5 && (
                                                    <div className="absolute top-3 left-3 bg-amber-400 text-white text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                                                        <span>Premium</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 space-y-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h4 className="font-black text-slate-900 text-base leading-tight group-hover:text-emerald-600 transition-colors">{hotel.name}</h4>
                                                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0 border border-amber-100/50">
                                                            <span className="text-amber-600 text-xs font-black">{hotel.rating}</span>
                                                            <Sparkles className="w-3 h-3 text-amber-500 fill-current" />
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{hotel.description}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 items-center pt-2 border-t border-slate-50">
                                                    {/* Airport Distance Badge */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                            <Plane className="w-3.5 h-3.5 text-slate-400" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 truncate">
                                                            {hotel.distanceFromAirport?.split(' from ')[0] || "Ойрхон"}
                                                        </span>
                                                    </div>

                                                    <a
                                                        href={`https://www.awin1.com/cread.php?awinmid=18117&awinaffid=2735044&clickref=gatesim_ai&p=${encodeURIComponent(hotel.bookingUrl || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + activeCityTab)}`)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center justify-center gap-2 h-9 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black transition-all active:scale-95 group/btn"
                                                    >
                                                        {isMongolian ? "Захиалах" : "Book Now"}
                                                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </a>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 gap-2">
                                <Button variant="ghost" onClick={handleBack} className="h-12 sm:h-14 px-2 sm:px-8 rounded-2xl font-bold shrink-0">
                                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                                    <span className="hidden sm:inline">{isMongolian ? "Буцах" : "Back"}</span>
                                </Button>
                                <div className="flex gap-2 flex-1 sm:flex-initial">
                                    <Button
                                        variant="outline"
                                        onClick={handleSkipStep4}
                                        className="h-12 sm:h-14 px-3 sm:px-8 rounded-2xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50 text-xs sm:text-base"
                                    >
                                        {isMongolian ? "Алгасах" : "Skip"}
                                    </Button>
                                    <Button onClick={handleNext} disabled={isDiscoveryLoading} className="h-12 sm:h-14 px-4 sm:px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-lg shadow-lg shadow-emerald-200 group flex-1 sm:flex-initial justify-center">
                                        {isMongolian ? "Үргэлжлүүлэх" : "Continue"}
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    step === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4 text-center">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900">{isMongolian ? "Юу хийх вэ?" : "What to do?"}</h2>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {isMongolian ? "Танд зориулсан тусгай санал" : "Tailored for your purposes"}
                                    </p>
                                </div>
                                <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {cityRoute.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => {
                                                setActiveCityTab(c.name);
                                                fetchDiscoveryData(activeCategory, c.name);
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

                            {/* Category Tabs Removed as per user request - auto-selected based on purpose */}

                            {isDiscoveryLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Card key={i} className="p-4 border-slate-100 animate-pulse">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-2xl bg-slate-50 shrink-0" />
                                                <div className="flex-1 space-y-3">
                                                    <div className="h-4 w-3/4 bg-slate-50 rounded" />
                                                    <div className="h-3 w-full bg-slate-50 rounded" />
                                                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* My Choice option for Activities */}
                                    <Card
                                        className={cn(
                                            "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative flex flex-col justify-between min-h-[110px]",
                                            selectedActivities.some(a => a.id === `custom-activity-${activeCityTab}`) ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-emerald-200"
                                        )}
                                        onClick={() => toggleActivity({
                                            id: `custom-activity-${activeCityTab}`,
                                            name: isMongolian ? "Өөрийн сонголт / Чөлөөт цаг" : "My choice / Free time",
                                            description: isMongolian ? "Төлөвлөгөөнд тусгай үзвэр оруулахгүй, өөрийнхөөрөө аялах" : "No specific activities, I will explore on my own",
                                            cityName: activeCityTab,
                                            price: "N/A",
                                            imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=200",
                                            address: isMongolian ? "Хотын төв" : "City Center"
                                        })}
                                    >
                                        <div className="p-4 flex gap-4 flex-1">
                                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 shrink-0 flex items-center justify-center border border-emerald-200 shadow-inner">
                                                <User className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors">
                                                        {isMongolian ? "Өөрийн сонголт" : "My choice"}
                                                    </h4>
                                                </div>
                                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                                                    {isMongolian ? "Төлөвлөгөөнд тусгай үзвэр оруулахгүй, чөлөөтэй явах" : "I'll decide my activities later"}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    {(activitiesByCategory[activeCategory] || []).map((activity: any) => (
                                        <Card
                                            key={activity.id}
                                            className={cn(
                                                "overflow-hidden transition-all duration-300 cursor-pointer group border-2 relative flex flex-col justify-between",
                                                selectedActivities.some(a => a.id === activity.id) ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-emerald-200"
                                            )}
                                            onClick={() => toggleActivity(activity)}
                                        >
                                            <div className="p-4 flex gap-4 flex-1">
                                                <div className="w-20 h-20 rounded-2xl bg-slate-100 shrink-0 overflow-hidden relative shadow-sm">
                                                    <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => { (e.target as any).src = `https://loremflickr.com/200/200/travel,${encodeURIComponent(activity.name.split(' ')[0])}`; }} />
                                                    {selectedActivities.some(a => a.id === activity.id) && (
                                                        <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                                                            <Check className="w-8 h-8 text-white drop-shadow-md" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors">{activity.name}</h4>
                                                        <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-white text-slate-500 shrink-0">{activity.price}</Badge>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-6">{activity.description}</p>
                                                    <div className="flex items-center gap-1.5 pt-1">
                                                        <div className="w-5 h-5 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                            <MapPin className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-400 truncate">{activity.address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4 gap-2">
                                <Button variant="ghost" onClick={handleBack} className="h-12 sm:h-14 px-2 sm:px-8 rounded-2xl font-bold shrink-0">
                                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                                    <span className="hidden sm:inline">{isMongolian ? "Буцах" : "Back"}</span>
                                </Button>
                                <div className="flex gap-2 flex-1 sm:flex-initial">
                                    <Button
                                        variant="outline"
                                        onClick={handleSkipStep5}
                                        className="h-12 sm:h-14 px-3 sm:px-8 rounded-2xl font-bold border-slate-200 text-slate-500 hover:bg-slate-50 text-xs sm:text-base"
                                    >
                                        {isMongolian ? "Алгасах" : "Skip"}
                                    </Button>
                                    <Button
                                        onClick={handleActivitiesContinue}
                                        disabled={isDiscoveryLoading}
                                        className="h-12 sm:h-14 px-4 sm:px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-lg shadow-lg shadow-emerald-200 group flex-1 sm:flex-initial justify-center"
                                    >
                                        {cityRoute.length === 0 || activeCityTab === cityRoute[cityRoute.length - 1]?.name
                                            ? (isMongolian ? "Төлөвлөгөө гаргах" : "Generate Plan")
                                            : (isMongolian ? "Үргэлжлүүлэх" : "Continue")
                                        }
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    step === 6 && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8 pb-20"
                        >
                            {isGenerating ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-8">
                                    {/* Premium Loader Animation */}
                                    <div className="relative w-32 h-32">
                                        <div className="absolute inset-0 rounded-full border-4 border-slate-100/50" />
                                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                        <div className="absolute inset-4 rounded-full border-4 border-slate-100/50" />
                                        <div className="absolute inset-4 rounded-full border-4 border-emerald-500/40 border-b-emerald-500 animate-[spin_3s_linear_infinite_reverse]" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center animate-pulse">
                                                <Sparkles className="w-8 h-8 text-emerald-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-center max-w-md mx-auto px-4">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={loadingPhase}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-2"
                                            >
                                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                                                    {loadingMessages[loadingPhase]}
                                                </h2>
                                                <p className="text-slate-400 text-sm font-medium">
                                                    {isMongolian ? "Түр хүлээнэ үү..." : "Please wait a moment..."}
                                                </p>
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Progress Bar */}
                                        <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                                            <motion.div
                                                className="h-full bg-emerald-500 rounded-full"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : itinerary ? (
                                <div className="space-y-8">
                                    <style jsx global>{`
                                        @media print {
                                            /* Hide everything by default */
                                            body > * { display: none !important; }
                                            
                                            /* Show only the itinerary content */
                                            body > #itinerary-root { display: block !important; }
                                            #itinerary-content { 
                                                display: block !important;
                                                position: absolute; 
                                                left: 0; 
                                                top: 0; 
                                                width: 100%; 
                                                margin: 0; 
                                                padding: 20px;
                                                background: white !important; 
                                                z-index: 9999;
                                            }
                                            
                                            /* Ensure content visibility */
                                            #itinerary-content * { visibility: visible; }
                                            
                                            /* Hide non-print elements explicitly */
                                            .no-print, header, footer, nav, .fixed { display: none !important; }
                                        }
                                    `}</style>

                                    <div id="itinerary-content" className="space-y-10">
                                        {/* Hero Header */}
                                        <div className="relative h-[300px] sm:h-[400px] rounded-[40px] overflow-hidden shadow-2xl">
                                            <img
                                                src={`https://source.unsplash.com/featured/?${encodeURIComponent(itinerary.city || destination)},travel`}
                                                alt={itinerary.city || destination}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200"; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 space-y-6">
                                                <div className="space-y-4 text-white">
                                                    <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                                                        {isMongolian ? "Төлөвлөгөө бэлэн" : "Itinerary Ready"}
                                                    </Badge>
                                                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-md">
                                                        {itinerary.city || destination}
                                                    </h1>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {[
                                                        { label: isMongolian ? "Хугацаа" : "Duration", value: `${itinerary.duration} ${isMongolian ? "өдөр" : "days"}`, icon: CalendarIcon },
                                                        { label: isMongolian ? "Нислэг" : "Flight", value: intlTransport === 'flight' ? "Yes" : "No", icon: Plane },
                                                        { label: isMongolian ? "Төсөв" : "Budget", value: itinerary.totalBudget?.split(' / ')[0] || "---", icon: Wallet },
                                                        { label: isMongolian ? "Travelers" : "Travelers", value: `${adults + children}`, icon: Users },
                                                    ].map((stat, i) => (
                                                        <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 text-white shadow-xl">
                                                            <div className="flex items-center gap-2 mb-1 opacity-60">
                                                                <stat.icon className="w-3 h-3" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{stat.label}</span>
                                                            </div>
                                                            <div className="text-xs sm:text-sm font-black truncate">{stat.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                            <div className="lg:col-span-8 space-y-12">
                                                {itinerary.days?.map((day: any, dayIdx: number) => (
                                                    <div key={dayIdx} className="relative">
                                                        <div className="flex items-center gap-6 mb-8 sticky top-4 z-20 bg-white/80 backdrop-blur-md py-2 px-4 rounded-2xl border border-slate-50/50 shadow-sm">
                                                            <div className="w-16 h-16 bg-slate-900 text-white rounded-[20px] flex flex-col items-center justify-center shrink-0">
                                                                <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">{isMongolian ? "Өдөр" : "Day"}</span>
                                                                <span className="text-2xl font-black leading-none">{day.day}</span>
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{day.title}</h3>
                                                                <p className="text-[10px] font-bold text-emerald-600 uppercase">
                                                                    {day.activities.length} {isMongolian ? "үйл ажиллагаа" : "activities"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="ml-8 border-l-2 border-slate-100 pl-10 space-y-6">
                                                            {day.activities.map((act: any, idx: number) => (
                                                                <div key={idx} className="relative group">
                                                                    <div className="absolute -left-[51px] top-4 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 z-10" />
                                                                    <Card className="p-5 rounded-[24px] border-2 border-slate-100">
                                                                        <div className="flex flex-col sm:flex-row gap-5">
                                                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                                                <Camera className="w-6 h-6 text-slate-400" />
                                                                            </div>
                                                                            <div className="flex-1 space-y-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{act.time}</span>
                                                                                    {act.cost && act.cost !== "0" && <Badge variant="outline" className="text-[10px] font-extrabold">{act.cost}</Badge>}
                                                                                </div>
                                                                                <h4 className="font-black text-slate-900 text-lg leading-tight">{act.activity}</h4>
                                                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                                                    <MapPin className="w-3.5 h-3.5" />
                                                                                    <span>{act.location}</span>
                                                                                </div>
                                                                                {act.notes && <p className="mt-2 text-[11px] text-amber-900/70 italic bg-amber-50/50 p-2 rounded-lg">{act.notes}</p>}
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Disclaimer */}
                                                <Card className="p-6 rounded-[32px] bg-slate-50 border-none text-center">
                                                    <div className="space-y-3">
                                                        <h3 className="text-sm font-black text-slate-900 flex items-center justify-center gap-2">
                                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                                            {isMongolian ? "Зардлын тооцоолол" : "Budget Calculation"}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {isMongolian
                                                                ? "Энэхүү төлөвлөгөөнд тусгагдсан зардлууд нь ойролцоо тооцоолол юм."
                                                                : "Costs listed are estimates and may not be 100% accurate."}
                                                        </p>
                                                    </div>
                                                </Card>
                                            </div>

                                            <div className="lg:col-span-4 space-y-6">
                                                <div className="sticky top-10 space-y-6">
                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-3 no-print">
                                                        <Button onClick={handleSaveTrip} disabled={isSavingTrip} className="h-16 rounded-[24px] bg-slate-900 text-white font-black text-lg">
                                                            {isSavingTrip ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                                                            {isMongolian ? "Төлөвлөгөө хадгалах" : "Save Plan"}
                                                        </Button>
                                                        <Button onClick={handleDownloadPDF} className="h-16 rounded-[24px] bg-emerald-600 text-white font-black text-lg">
                                                            <Download className="w-5 h-5 mr-3" />
                                                            {isMongolian ? "PDF Татах" : "Download PDF"}
                                                        </Button>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Button variant="outline" onClick={handleShare} className="h-14 rounded-[20px] font-bold">
                                                                <Share2 className="w-4 h-4 mr-2" /> Share
                                                            </Button>
                                                            <Button variant="outline" onClick={handleBack} className="h-14 rounded-[20px] font-bold">
                                                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Travel Prep */}
                                                    <Card className="p-6 rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50 space-y-4 no-print">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Backpack className="w-5 h-5 text-slate-600" />
                                                                <h3 className="font-black text-slate-900">Travel Prep</h3>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={() => setShowChecklist(!showChecklist)} className="font-bold">
                                                                {showChecklist ? "Close" : "View"}
                                                            </Button>
                                                        </div>
                                                        {showChecklist && (
                                                            <div className="space-y-4 pt-2">
                                                                <ul className="grid grid-cols-1 gap-1.5 list-none p-0">
                                                                    {[
                                                                        "Passport & Visa", "GateSIM eSIM", "Charger", "Comfortable shoes"
                                                                    ].map((item, i) => (
                                                                        <li key={i} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                                                                            <Check className="w-3 h-3 text-emerald-500" /> {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Print Footer */}
                                        <div className="hidden print:block pt-12 text-center text-[10px] text-slate-400 border-t">
                                            Generated by GateSIM AI Travel Planner
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center space-y-6">
                                    <ArrowLeft className="w-10 h-10 text-red-500 mx-auto" />
                                    <p className="text-slate-900 font-black text-xl">Error</p>
                                    <Button onClick={handleFinalize} className="rounded-2xl h-12 px-8 bg-slate-900 font-black">Retry</Button>
                                </div>
                            )}
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    );
}

