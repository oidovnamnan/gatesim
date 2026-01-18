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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, parseISO, differenceInDays } from "date-fns";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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

// City suggestions for popular destinations
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
    "TW": [
        { name: "Тайбэй", nameEn: "Taipei" },
        { name: "Гаосюн", nameEn: "Kaohsiung" },
        { name: "Тайчжун", nameEn: "Taichung" },
        { name: "Тайнань", nameEn: "Tainan" },
        { name: "Хуалянь", nameEn: "Hualien" },
    ],
    "HK": [
        { name: "Хонконг арал", nameEn: "Hong Kong Island" },
        { name: "Ковлун", nameEn: "Kowloon" },
        { name: "Лантау", nameEn: "Lantau" },
    ],
    "AE": [
        { name: "Дубай", nameEn: "Dubai" },
        { name: "Абу Даби", nameEn: "Abu Dhabi" },
        { name: "Шаржа", nameEn: "Sharjah" },
    ],
    "TR": [
        { name: "Истанбул", nameEn: "Istanbul" },
        { name: "Анталья", nameEn: "Antalya" },
        { name: "Каппадокия", nameEn: "Cappadocia" },
        { name: "Анкара", nameEn: "Ankara" },
        { name: "Измир", nameEn: "Izmir" },
        { name: "Бодрум", nameEn: "Bodrum" },
    ],
    "IN": [
        { name: "Дели", nameEn: "Delhi" },
        { name: "Мумбай", nameEn: "Mumbai" },
        { name: "Гоа", nameEn: "Goa" },
        { name: "Жайпур", nameEn: "Jaipur" },
        { name: "Бангалор", nameEn: "Bangalore" },
        { name: "Агра", nameEn: "Agra" },
    ],
    "AU": [
        { name: "Сидней", nameEn: "Sydney" },
        { name: "Мельбурн", nameEn: "Melbourne" },
        { name: "Брисбен", nameEn: "Brisbane" },
        { name: "Голд Кост", nameEn: "Gold Coast" },
        { name: "Перт", nameEn: "Perth" },
        { name: "Кэрнс", nameEn: "Cairns" },
    ],
    "GB": [
        { name: "Лондон", nameEn: "London" },
        { name: "Манчестер", nameEn: "Manchester" },
        { name: "Эдинбург", nameEn: "Edinburgh" },
        { name: "Бирмингем", nameEn: "Birmingham" },
        { name: "Ливерпүүл", nameEn: "Liverpool" },
        { name: "Оксфорд", nameEn: "Oxford" },
    ],
    "FR": [
        { name: "Парис", nameEn: "Paris" },
        { name: "Ницц", nameEn: "Nice" },
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
        { name: "Неапол", nameEn: "Naples" },
    ],
    "ES": [
        { name: "Барселон", nameEn: "Barcelona" },
        { name: "Мадрид", nameEn: "Madrid" },
        { name: "Севилья", nameEn: "Seville" },
        { name: "Валенси", nameEn: "Valencia" },
        { name: "Гранада", nameEn: "Granada" },
    ],
    "RU": [
        { name: "Москва", nameEn: "Moscow" },
        { name: "Санкт-Петербург", nameEn: "Saint Petersburg" },
        { name: "Сочи", nameEn: "Sochi" },
        { name: "Казань", nameEn: "Kazan" },
        { name: "Владивосток", nameEn: "Vladivostok" },
        { name: "Иркутск", nameEn: "Irkutsk" },
    ],
    "CA": [
        { name: "Торонто", nameEn: "Toronto" },
        { name: "Ванкувер", nameEn: "Vancouver" },
        { name: "Монреал", nameEn: "Montreal" },
        { name: "Калгари", nameEn: "Calgary" },
        { name: "Оттава", nameEn: "Ottawa" },
    ],
    "NZ": [
        { name: "Оукланд", nameEn: "Auckland" },
        { name: "Квинстаун", nameEn: "Queenstown" },
        { name: "Веллингтон", nameEn: "Wellington" },
        { name: "Крайстчерч", nameEn: "Christchurch" },
        { name: "Роторуа", nameEn: "Rotorua" },
    ],
    "KH": [
        { name: "Пном Пень", nameEn: "Phnom Penh" },
        { name: "Сием Рип", nameEn: "Siem Reap" },
        { name: "Сиануквилл", nameEn: "Sihanoukville" },
    ],
    "LA": [
        { name: "Вьентьян", nameEn: "Vientiane" },
        { name: "Луан Прабан", nameEn: "Luang Prabang" },
        { name: "Ванг Виенг", nameEn: "Vang Vieng" },
    ],
    "MM": [
        { name: "Янгон", nameEn: "Yangon" },
        { name: "Баган", nameEn: "Bagan" },
        { name: "Мандалай", nameEn: "Mandalay" },
    ],
    "NP": [
        { name: "Катманду", nameEn: "Kathmandu" },
        { name: "Покхара", nameEn: "Pokhara" },
        { name: "Читван", nameEn: "Chitwan" },
    ],
    "LK": [
        { name: "Коломбо", nameEn: "Colombo" },
        { name: "Канди", nameEn: "Kandy" },
        { name: "Галле", nameEn: "Galle" },
        { name: "Элла", nameEn: "Ella" },
    ],
    "MV": [
        { name: "Мале", nameEn: "Male" },
        { name: "Маафуши", nameEn: "Maafushi" },
    ],
    "EG": [
        { name: "Каир", nameEn: "Cairo" },
        { name: "Луксор", nameEn: "Luxor" },
        { name: "Хургада", nameEn: "Hurghada" },
        { name: "Шарм эль Шейх", nameEn: "Sharm El Sheikh" },
    ],
    "GR": [
        { name: "Афин", nameEn: "Athens" },
        { name: "Санторини", nameEn: "Santorini" },
        { name: "Миконос", nameEn: "Mykonos" },
        { name: "Крит", nameEn: "Crete" },
    ],
    "PT": [
        { name: "Лиссабон", nameEn: "Lisbon" },
        { name: "Порту", nameEn: "Porto" },
        { name: "Алгарве", nameEn: "Algarve" },
    ],
    "NL": [
        { name: "Амстердам", nameEn: "Amsterdam" },
        { name: "Роттердам", nameEn: "Rotterdam" },
        { name: "Гаага", nameEn: "The Hague" },
    ],
    "CH": [
        { name: "Цюрих", nameEn: "Zurich" },
        { name: "Женев", nameEn: "Geneva" },
        { name: "Интерлакен", nameEn: "Interlaken" },
        { name: "Люцерн", nameEn: "Lucerne" },
    ],
    "AT": [
        { name: "Вена", nameEn: "Vienna" },
        { name: "Зальцбург", nameEn: "Salzburg" },
        { name: "Инсбрук", nameEn: "Innsbruck" },
    ],
    "CZ": [
        { name: "Прага", nameEn: "Prague" },
        { name: "Брно", nameEn: "Brno" },
        { name: "Карловы Вары", nameEn: "Karlovy Vary" },
    ],
    "HU": [
        { name: "Будапешт", nameEn: "Budapest" },
        { name: "Дебрецен", nameEn: "Debrecen" },
    ],
    "PL": [
        { name: "Варшав", nameEn: "Warsaw" },
        { name: "Краков", nameEn: "Krakow" },
        { name: "Гданьск", nameEn: "Gdansk" },
    ],
    "SE": [
        { name: "Стокгольм", nameEn: "Stockholm" },
        { name: "Гётеборг", nameEn: "Gothenburg" },
        { name: "Мальмё", nameEn: "Malmo" },
    ],
    "FI": [
        { name: "Хельсинки", nameEn: "Helsinki" },
        { name: "Рованиеми", nameEn: "Rovaniemi" },
        { name: "Тампере", nameEn: "Tampere" },
    ],
    "NO": [
        { name: "Осло", nameEn: "Oslo" },
        { name: "Берген", nameEn: "Bergen" },
        { name: "Тромсо", nameEn: "Tromso" },
    ],
    "DK": [
        { name: "Копенгаген", nameEn: "Copenhagen" },
        { name: "Орхус", nameEn: "Aarhus" },
    ],
    "IE": [
        { name: "Дублин", nameEn: "Dublin" },
        { name: "Корк", nameEn: "Cork" },
        { name: "Голвей", nameEn: "Galway" },
    ],
    "BE": [
        { name: "Брюссель", nameEn: "Brussels" },
        { name: "Брюгге", nameEn: "Bruges" },
        { name: "Антверпен", nameEn: "Antwerp" },
    ],
    "MX": [
        { name: "Мехико", nameEn: "Mexico City" },
        { name: "Канкун", nameEn: "Cancun" },
        { name: "Плая дел Кармен", nameEn: "Playa del Carmen" },
        { name: "Лос Кабос", nameEn: "Los Cabos" },
    ],
    "BR": [
        { name: "Рио де Жанейро", nameEn: "Rio de Janeiro" },
        { name: "Сан Паулу", nameEn: "Sao Paulo" },
        { name: "Сальвадор", nameEn: "Salvador" },
    ],
    "AR": [
        { name: "Буэнос Айрес", nameEn: "Buenos Aires" },
        { name: "Мендоса", nameEn: "Mendoza" },
        { name: "Патагони", nameEn: "Patagonia" },
    ],
    "ZA": [
        { name: "Кейптаун", nameEn: "Cape Town" },
        { name: "Йоханнесбург", nameEn: "Johannesburg" },
        { name: "Дурбан", nameEn: "Durban" },
    ],
    "MA": [
        { name: "Марракеш", nameEn: "Marrakech" },
        { name: "Касабланка", nameEn: "Casablanca" },
        { name: "Фес", nameEn: "Fez" },
    ],
    "IL": [
        { name: "Тель Авив", nameEn: "Tel Aviv" },
        { name: "Иерусалим", nameEn: "Jerusalem" },
        { name: "Эйлат", nameEn: "Eilat" },
    ],
    "JO": [
        { name: "Амман", nameEn: "Amman" },
        { name: "Петра", nameEn: "Petra" },
        { name: "Акаба", nameEn: "Aqaba" },
    ],
    "SA": [
        { name: "Рияд", nameEn: "Riyadh" },
        { name: "Жедда", nameEn: "Jeddah" },
        { name: "Мекка", nameEn: "Mecca" },
        { name: "Медина", nameEn: "Medina" },
    ],
    "QA": [
        { name: "Доха", nameEn: "Doha" },
    ],
};

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
    city?: string;
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
    const [purposes, setPurposes] = useState<string[]>(["tourist"]);
    const [budget, setBudget] = useState("mid");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [recommendedPackage, setRecommendedPackage] = useState<any>(null);
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);
    const router = useRouter();

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
    const [isCustomCity, setIsCustomCity] = useState(false);
    const [transportMode, setTransportMode] = useState<"flight" | "train" | "bus" | "car" | "">("");
    const [savedTripId, setSavedTripId] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedBooking, setExtractedBooking] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
                    purpose: purposes.join(", "),
                    budget,
                    language: language,
                    city: city === 'none' ? '' : city,
                    transportMode,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setItinerary(data.itinerary);
                setExpandedDays([1]); // Expand first day by default

                // Save to session storage for AI Chat context
                sessionStorage.setItem("gateSIM_activePlan", JSON.stringify({
                    type: purposes.join(", "),
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

    // Fetch recommended package when itinerary changes
    useEffect(() => {
        if (itinerary?.destination && itinerary?.duration) {
            fetch(`/api/ai/recommend-package?country=${itinerary.destination}&duration=${itinerary.duration}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setRecommendedPackage(data.package);
                    }
                })
                .catch(err => console.error("Failed to fetch recommendation", err));
        } else {
            setRecommendedPackage(null);
        }
    }, [itinerary]);

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
            const res = await createTrip({
                // @ts-ignore
                userId: (session?.user as any).id || session?.user?.email,
                destination: isCustomDestination ? destination : (destinations.find(d => d.code === destination)?.nameEn || destination),
                duration,
                purpose: purposes.join(', '),
                budget,
                itinerary
            });
            if (res.id) {
                setSavedTripId(res.id);
                setIsSaved(true);
            }
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const handleShare = () => {
        if (!savedTripId) return;
        const shareUrl = `${window.location.origin}/share/trip/${savedTripId}${isMongolian ? '?lang=mn' : ''}`;

        if (navigator.share) {
            navigator.share({
                title: isMongolian ? 'Миний аяллын төлөвлөгөө' : 'My Travel Plan',
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert(isMongolian ? 'Холбоос хуулагдлаа!' : 'Link copied to clipboard!');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/ai/extract-booking", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                setExtractedBooking(result.data);
                setIsBookingModalOpen(true);
            } else {
                alert(result.error || "Extraction failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleConfirmBooking = () => {
        if (!itinerary || !extractedBooking) return;

        const bookingDate = parseISO(extractedBooking.dateTime);
        const tripStart = startDate || new Date();
        const dayDiff = differenceInDays(bookingDate, tripStart);

        if (dayDiff < 0 || dayDiff >= itinerary.days.length) {
            alert(isMongolian ? "Энэ өдөр аяллын төлөвлөгөөнд ороогүй байна." : "This date is outside of your trip duration.");
            return;
        }

        const newItinerary = { ...itinerary };
        const timeStr = format(bookingDate, "HH:mm");

        const newActivity = {
            time: timeStr,
            activity: extractedBooking.name,
            location: extractedBooking.location,
            cost: "Included",
            description: extractedBooking.description || "",
            type: extractedBooking.type
        };

        newItinerary.days[dayDiff].activities.push(newActivity);
        // Sort activities by time
        newItinerary.days[dayDiff].activities.sort((a, b) => a.time.localeCompare(b.time));

        setItinerary(newItinerary);
        setIsSaved(false);
        setIsBookingModalOpen(false);
        setExtractedBooking(null);
    };

    return (
        <div className={cn("space-y-6 pb-32", className)}>
            {/* Destination Selection */}
            <div className="print:hidden">
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
                        // Reset city selection when destination changes
                        setCity("");
                        setIsCustomCity(false);
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
            <div className="print:hidden">
                <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {isMongolian ? "Хот (Сонголттой)" : "City (Optional)"}
                </h3>

                {!isCustomDestination && CITY_SUGGESTIONS[destination] ? (
                    <div className="space-y-3">
                        <Select
                            value={isCustomCity ? "custom" : city}
                            onValueChange={(val) => {
                                if (val === "custom") {
                                    setCity("");
                                    setIsCustomCity(true);
                                } else {
                                    setCity(val);
                                    setIsCustomCity(false);
                                }
                            }}
                        >
                            <SelectTrigger className="w-full h-12 rounded-xl text-base bg-white border-slate-200">
                                <SelectValue placeholder={isMongolian ? "Хот сонгох" : "Select city"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    {isMongolian ? "Сонгохгүй" : "Skip / Not specified"}
                                </SelectItem>
                                {CITY_SUGGESTIONS[destination].map((c) => (
                                    <SelectItem key={c.nameEn} value={c.nameEn}>
                                        {isMongolian ? c.name : c.nameEn}
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom">
                                    {isMongolian ? "Бусад (Гараар бичих)" : "Other (Enter manually)"}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <AnimatePresence>
                            {isCustomCity && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder={isMongolian ? "Хотын нэр бичнэ үү..." : "Enter city name..."}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                        autoFocus
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <input
                        type="text"
                        value={city === "none" ? "" : city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={isMongolian ? "Хот эсвэл бүс нутаг..." : "Enter city or region..."}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                    />
                )}
            </div>

            {/* Start Date Selection */}
            <div className="print:hidden">
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
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            modifiers={{
                                today: new Date(),
                            }}
                            modifiersClassNames={{
                                today: "bg-emerald-100 text-emerald-700 font-bold rounded-full",
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Transport Mode Selection */}
            <div className="print:hidden">
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
            <div className="print:hidden">
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
            <div className="print:hidden">
                <h3 className="font-bold mb-3">
                    {isMongolian ? "Аяллын зорилго" : "Trip purpose"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tripPurposes.map((p) => {
                        const Icon = p.icon;
                        const isSelected = purposes.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => {
                                    if (isSelected) {
                                        if (purposes.length > 1) {
                                            setPurposes(purposes.filter(id => id !== p.id));
                                        }
                                    } else {
                                        setPurposes([...purposes, p.id]);
                                    }
                                }}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-2xl font-bold text-sm transition-all",
                                    isSelected
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
            <div className="print:hidden">
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
            <div className="print:hidden pb-10 border-b border-slate-100">
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
            </div>

            {/* Generated Itinerary */}
            <AnimatePresence>
                {itinerary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Summary Card */}
                        <Card className="overflow-hidden border-emerald-500/20 shadow-lg shadow-emerald-500/5 bg-white">
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-emerald-100/50">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl shrink-0">
                                            {destinations.find(d => d.code === itinerary.destination)?.flag || "🌍"}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-xl text-slate-900 truncate">
                                                {destinations.find(d => d.code === itinerary.destination)?.[isMongolian ? "name" : "nameEn"] || itinerary.destination}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                                {itinerary.city && <span>{itinerary.city}</span>}
                                                {itinerary.city && <span className="text-slate-300">•</span>}
                                                <span className="text-emerald-600">
                                                    {itinerary.duration} {isMongolian ? "хоногийн аялал" : "day trip"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">{isMongolian ? "Төсөв" : "Budget"}</p>
                                            <p className="text-xl font-black text-emerald-600">{itinerary.totalBudget}</p>
                                        </div>
                                        <Badge className="sm:hidden bg-emerald-600 text-white font-bold px-4 py-2">
                                            {itinerary.totalBudget}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Utility Action Bar */}
                                <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 w-full mb-1 sm:w-auto sm:mb-0">
                                        {isMongolian ? "Үйлдэл:" : "Actions:"}
                                    </p>

                                    <div className="flex items-center gap-2 flex-1">
                                        {isSaved && savedTripId && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="gap-2 h-8 px-3 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm transition-all"
                                                onClick={handleShare}
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-bold">{isMongolian ? "Хуваалцах" : "Share"}</span>
                                            </Button>
                                        )}

                                        <input
                                            type="file"
                                            id="booking-upload"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="gap-2 h-8 px-3 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 shadow-sm transition-all"
                                            onClick={() => document.getElementById('booking-upload')?.click()}
                                            disabled={isExtracting}
                                        >
                                            {isExtracting ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="w-3.5 h-3.5" />
                                            )}
                                            <span className="text-[11px] font-bold">{isMongolian ? "Төлөвлөгөө нэмэх" : "Add Booking"}</span>
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-2 h-8 px-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm transition-all print:hidden"
                                        onClick={handleDownloadPDF}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-bold">PDF</span>
                                    </Button>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 print:hidden">
                                    <div className="flex-1 min-w-0">
                                        {recommendedPackage ? (
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-emerald-500/30 transition-all">
                                                <div className="flex items-start sm:items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200/50">
                                                        <Smartphone className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">
                                                            {isMongolian ? "GateSIM Дата Багц" : "GateSIM eSIM Bundle"}
                                                        </span>
                                                        <p className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                                                            {recommendedPackage.name}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium">
                                                            <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100 text-slate-600">
                                                                {recommendedPackage.dataAmount === -1 ? "Unlimited" : `${recommendedPackage.dataAmount / 1024}GB`}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100 text-slate-600">
                                                                {recommendedPackage.durationDays} {isMongolian ? "хоног" : "days"}
                                                            </span>
                                                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-bold text-emerald-700">
                                                                {(recommendedPackage.price / 1000).toFixed(0)}K MNT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-9 px-4 text-[11px] font-black text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-600 rounded-lg shrink-0 transition-all w-full sm:w-auto"
                                                    onClick={() => router.push(`/checkout?package=${recommendedPackage.sku}&country=${itinerary.destination}`)}
                                                >
                                                    {isMongolian ? "Авах" : "Buy Now"}
                                                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                                                <p className="text-[11px] text-slate-500 italic">
                                                    📱 {itinerary.esimRecommendation}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 justify-end">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all gap-1.5"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                                            <span className="text-xs font-bold">
                                                {isEditing ? (isMongolian ? "Болих" : "Stop") : (isMongolian ? "Засах" : "Edit")}
                                            </span>
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant={isSaved ? "outline" : "default"}
                                            className={cn(
                                                "h-9 px-4 font-bold text-xs gap-1.5 shadow-sm transition-all",
                                                isSaved
                                                    ? "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                                                    : session?.user
                                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        : "bg-slate-400 hover:bg-slate-500 text-white cursor-not-allowed"
                                            )}
                                            onClick={() => {
                                                if (!session?.user) {
                                                    alert(isMongolian ? "Та нэвтэрч байж хадгалах боломжтой" : "Please log in to save your plan");
                                                    return;
                                                }
                                                handleSave();
                                            }}
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
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Budget Dashboard */}
                        {
                            itinerary.budgetBreakdown && itinerary.budgetBreakdown.length > 0 && (
                                <Card className="p-4 bg-white border-slate-200 print:shadow-none print:border-slate-100">
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
                            )
                        }

                        {/* Map */}
                        {
                            itinerary.days.some(d => d.activities.some(a => a.coordinates)) && (
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
                            )
                        }

                        {/* Day-by-Day Itinerary */}
                        {
                            itinerary.days.map((day, dayIndex) => (
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
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                                <MapPin className="w-3 h-3" />
                                                                                {activity.location}
                                                                            </p>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-5 w-5 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                                onClick={() => {
                                                                                    const destination = activity.coordinates
                                                                                        ? `${activity.coordinates.lat},${activity.coordinates.lng}`
                                                                                        : encodeURIComponent(activity.location);
                                                                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`, '_blank');
                                                                                }}
                                                                                title={isMongolian ? "Нийтийн тээврээр" : "Get Transit Directions"}
                                                                            >
                                                                                <Bus className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
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
                            ))
                        }

                        {/* Tips */}
                        {
                            itinerary.tips.length > 0 && (
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
                            )
                        }

                        {/* Packing List */}
                        {
                            itinerary.packingList && itinerary.packingList.length > 0 && (
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
                            )
                        }

                    </motion.div >
                )
                }
            </AnimatePresence >

            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>{isMongolian ? "Төлөвлөгөө нэмэх" : "Add Booking"}</DialogTitle>
                    </DialogHeader>
                    {extractedBooking && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                    {extractedBooking.type === 'flight' ? <Plane className="w-5 h-5" /> :
                                        extractedBooking.type === 'hotel' ? <Hotel className="w-5 h-5" /> :
                                            <MapPin className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">{extractedBooking.name}</h4>
                                    <p className="text-xs text-slate-500">{extractedBooking.location}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 block uppercase">
                                        {format(parseISO(extractedBooking.dateTime), "HH:mm")}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {format(parseISO(extractedBooking.dateTime), "MMM d")}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">{isMongolian ? "Тайлбар" : "Description"}</label>
                                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                    {extractedBooking.description}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsBookingModalOpen(false)}
                            className="rounded-xl"
                        >
                            {isMongolian ? "Болих" : "Cancel"}
                        </Button>
                        <Button
                            onClick={handleConfirmBooking}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                        >
                            {isMongolian ? "Төлөвлөгөөнд нэмэх" : "Add to Itinerary"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >

    );
}

export default AITravelPlanner;
