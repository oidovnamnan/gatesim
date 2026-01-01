/**
 * Country Travel Information Database
 * Contains travel guides, transportation, tips for popular destinations
 */

export interface CountryTransport {
    type: "metro" | "bus" | "train" | "taxi" | "app";
    name: string;
    description: string;
    app?: string;
    appUrl?: string;
    priceRange?: string;
    tips?: string[];
}

export interface CountryTip {
    category: "safety" | "culture" | "money" | "food" | "language" | "connectivity";
    title: string;
    description: string;
    icon?: string;
}

export interface CountryEmergency {
    police: string;
    ambulance: string;
    fire: string;
    tourist?: string;
}

export interface CountryInfo {
    slug: string;
    name: string;
    nameMn: string;
    flag: string;
    capital: string;
    currency: string;
    currencySymbol: string;
    language: string;
    timezone: string;
    emergencyNumbers: CountryEmergency;
    transport: CountryTransport[];
    tips: CountryTip[];
    phrases: { phrase: string; meaning: string; pronunciation?: string }[];
    simInfo: {
        networks: string[];
        coverage: string;
        speed: string;
    };
}

export const countryInfoDatabase: Record<string, CountryInfo> = {
    japan: {
        slug: "japan",
        name: "Japan",
        nameMn: "Япон",
        flag: "🇯🇵",
        capital: "Tokyo",
        currency: "Japanese Yen",
        currencySymbol: "¥",
        language: "Japanese",
        timezone: "JST (UTC+9)",
        emergencyNumbers: {
            police: "110",
            ambulance: "119",
            fire: "119",
            tourist: "03-3501-0110",
        },
        transport: [
            {
                type: "train",
                name: "JR Pass",
                description: "Бүх JR галт тэрэгний үйлчилгээнд хязгааргүй зорчих боломжтой",
                priceRange: "¥29,650 (7 хоног)",
                tips: [
                    "Урьдчилж онлайнаар захиалах нь хямд",
                    "Нарита/Ханеда нисэх буудлаас Токио руу ашиглах боломжтой",
                ],
            },
            {
                type: "metro",
                name: "Tokyo Metro / Suica Card",
                description: "Токио хотын метро болон автобус",
                app: "Suica",
                appUrl: "https://www.jreast.co.jp/e/suica-e/",
                priceRange: "¥200-500 нэг зорчилт",
                tips: [
                    "Suica картаа Apple Pay-д нэмж болно",
                    "Бүх дэлгүүрт мөн ашиглах боломжтой",
                ],
            },
            {
                type: "app",
                name: "Japan Taxi",
                description: "Такси дуудах апп",
                app: "Japan Taxi",
                appUrl: "https://japantaxi.jp/",
                priceRange: "¥500+ эхлэх үнэ",
            },
        ],
        tips: [
            {
                category: "connectivity",
                title: "eSIM идэвхжүүлэх",
                description: "Япон руу нисэхээсээ өмнө eSIM-ээ суулгаарай. Буух үед шууд ажиллана.",
                icon: "📱",
            },
            {
                category: "money",
                title: "Бэлэн мөнгө авч яваарай",
                description: "Олон газар зөвхөн бэлнээр төлдөг. 7-Eleven ATM гадаадын карт авдаг.",
                icon: "💴",
            },
            {
                category: "culture",
                title: "Гутлаа тайлаарай",
                description: "Зочны байр, сүм, заримдаа ресторанд гутлаа тайлдаг.",
                icon: "👟",
            },
            {
                category: "food",
                title: "Хоолны машин",
                description: "Олон ресторанд эхлээд машинаас хоолоо захиалж төлнө.",
                icon: "🍜",
            },
            {
                category: "language",
                title: "Google Translate ашиглах",
                description: "Камераар япон үсгийг орчуулж болно. Offline орчуулга татаж аваарай.",
                icon: "🈯",
            },
        ],
        phrases: [
            { phrase: "Arigatou gozaimasu", meaning: "Баярлалаа", pronunciation: "А-ри-га-тоо го-зай-мас" },
            { phrase: "Sumimasen", meaning: "Уучлаарай / Танд хандъя", pronunciation: "Су-ми-ма-сэн" },
            { phrase: "Ikura desu ka?", meaning: "Энэ хэд вэ?", pronunciation: "И-ку-ра дэс ка?" },
            { phrase: "Eigo ga hanasemasu ka?", meaning: "Та англиар ярьдаг уу?", pronunciation: "Эй-го га ха-на-сэ-мас ка?" },
        ],
        simInfo: {
            networks: ["NTT Docomo", "SoftBank", "au (KDDI)"],
            coverage: "99% хотод, 95% хөдөө",
            speed: "4G/LTE 50-150 Mbps, 5G бэлэн",
        },
    },

    "south-korea": {
        slug: "south-korea",
        name: "South Korea",
        nameMn: "Өмнөд Солонгос",
        flag: "🇰🇷",
        capital: "Seoul",
        currency: "Korean Won",
        currencySymbol: "₩",
        language: "Korean",
        timezone: "KST (UTC+9)",
        emergencyNumbers: {
            police: "112",
            ambulance: "119",
            fire: "119",
            tourist: "1330",
        },
        transport: [
            {
                type: "metro",
                name: "Seoul Metro / T-money",
                description: "Сөүл хотын метро, автобус - T-money картаар",
                app: "Kakao Metro",
                priceRange: "₩1,250 эхлэх үнэ",
                tips: [
                    "T-money картыг буудлын дэлгүүрээс авах боломжтой",
                    "Метроны WiFi маш хурдан",
                ],
            },
            {
                type: "train",
                name: "KTX",
                description: "Хурдны галт тэрэг - Сөүл-Пусан 2.5 цаг",
                app: "Korail",
                appUrl: "https://www.letskorail.com/",
                priceRange: "₩50,000-60,000",
            },
            {
                type: "app",
                name: "Kakao T",
                description: "Такси, унадаг дугуй, хамтын тээвэр",
                app: "Kakao T",
                appUrl: "https://kakaot.com/",
                priceRange: "₩3,800+ эхлэх үнэ",
            },
        ],
        tips: [
            {
                category: "connectivity",
                title: "Шилдэг интернет",
                description: "Солонгос дэлхийн хамгийн хурдан интернеттэй. eSIM бүрэн ажиллана.",
                icon: "⚡",
            },
            {
                category: "money",
                title: "Карт бүр дээр ажиллана",
                description: "Бараг бүх газар карт авдаг, Apple/Google Pay-ч ажиллана.",
                icon: "💳",
            },
            {
                category: "food",
                title: "Banchan үнэгүй",
                description: "Солонгос хоолонд дагалдах савнууд (kimchi гэх мэт) үнэгүй, дахин авч болно.",
                icon: "🥢",
            },
            {
                category: "culture",
                title: "Ахмад хүнийг хүндлэх",
                description: "Метронд өндөр настанд суудлаа тавьж өгөх нь заншил.",
                icon: "🙏",
            },
        ],
        phrases: [
            { phrase: "Annyeonghaseyo", meaning: "Сайн байна уу", pronunciation: "Ан-ёнг-ха-сэ-ё" },
            { phrase: "Kamsahamnida", meaning: "Баярлалаа", pronunciation: "Кам-са-хам-ни-да" },
            { phrase: "Eolma-yeyo?", meaning: "Энэ хэд вэ?", pronunciation: "Өл-ма-е-ё?" },
            { phrase: "Juseyo", meaning: "Өгнө үү", pronunciation: "Чу-сэ-ё" },
        ],
        simInfo: {
            networks: ["SK Telecom", "KT", "LG U+"],
            coverage: "99%+ бүх газар",
            speed: "4G 100+ Mbps, 5G 500+ Mbps",
        },
    },

    thailand: {
        slug: "thailand",
        name: "Thailand",
        nameMn: "Тайланд",
        flag: "🇹🇭",
        capital: "Bangkok",
        currency: "Thai Baht",
        currencySymbol: "฿",
        language: "Thai",
        timezone: "ICT (UTC+7)",
        emergencyNumbers: {
            police: "191",
            ambulance: "1669",
            fire: "199",
            tourist: "1155",
        },
        transport: [
            {
                type: "metro",
                name: "BTS Skytrain / MRT",
                description: "Бангкок хотын өргөгдсөн болон газар доорх метро",
                app: "BTS SkyTrain",
                priceRange: "฿16-59 нэг зорчилт",
                tips: [
                    "Rabbit карт олон удаа зорчиход хямд",
                    "Peak цагт маш түгжирдэг",
                ],
            },
            {
                type: "app",
                name: "Grab",
                description: "Такси, мотоцикл, хоол хүргэлт",
                app: "Grab",
                appUrl: "https://www.grab.com/",
                priceRange: "฿35+ эхлэх үнэ",
                tips: [
                    "Мотоциклийн таксиг түгжрэлтэй үед ашиглах",
                    "GrabPay-г урьдчилж цэнэглэх",
                ],
            },
            {
                type: "taxi",
                name: "Энгийн такси",
                description: "Метрээр эсвэл тогтмол үнээр",
                priceRange: "฿35 эхлэх үнэ + ฿5.50/km",
                tips: [
                    "Метр асааж өгөхийг хүс",
                    "Түгжрэлтэй үед мотоцикл хямд",
                ],
            },
        ],
        tips: [
            {
                category: "culture",
                title: "Хаан, сүмийг хүндлэх",
                description: "Хааны гэр бүлийн талаар муу яриа хэлэх нь хууль бус. Сүмд богино өмд, нүцгэн мөр хориотой.",
                icon: "👑",
            },
            {
                category: "money",
                title: "Үнэ хэлэлцэх",
                description: "Зах, жижиг дэлгүүрт үнэ хэлэлцэж болно. Том дэлгүүрт үгүй.",
                icon: "💰",
            },
            {
                category: "food",
                title: "Гудамжны хоол",
                description: "Аюулгүй, амттай, хямд. Олон хүн идэж байгаа газар сонго.",
                icon: "🍜",
            },
            {
                category: "safety",
                title: "Халуун цаг агаар",
                description: "Их ус уух, нарны тос хэрэглэх. 3-5 сард хамгийн халуун.",
                icon: "☀️",
            },
        ],
        phrases: [
            { phrase: "Sawasdee krap/ka", meaning: "Сайн байна уу", pronunciation: "Са-ват-ди крап/ка" },
            { phrase: "Khob khun krap/ka", meaning: "Баярлалаа", pronunciation: "Коп кун крап/ка" },
            { phrase: "Tao rai?", meaning: "Хэд вэ?", pronunciation: "Тао рай?" },
            { phrase: "Mai phet", meaning: "Халуунгүй (хоолонд)", pronunciation: "Май пхэт" },
        ],
        simInfo: {
            networks: ["AIS", "TrueMove H", "dtac"],
            coverage: "95% хотод, 80% арлуудад",
            speed: "4G 20-50 Mbps",
        },
    },
};

export function getCountryInfo(slug: string): CountryInfo | undefined {
    return countryInfoDatabase[slug];
}

export function getAllCountries(): CountryInfo[] {
    return Object.values(countryInfoDatabase);
}
