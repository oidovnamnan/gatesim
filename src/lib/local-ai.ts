
import { countryInfoDatabase, CountryInfo } from "@/data/country-info";

// Улсын нэрсийн түлхүүр үгс
const countryKeywords: Record<string, string> = {
    "япон": "japan",
    "japan": "japan",
    "jp": "japan",
    "токио": "japan",
    "tokyo": "japan",

    "солонгос": "south-korea",
    "korea": "south-korea",
    "kr": "south-korea",
    "сөүл": "south-korea",
    "seoul": "south-korea",

    "тайланд": "thailand",
    "thailand": "thailand",
    "th": "thailand",
    "бангкок": "thailand",
    "bangkok": "thailand",
};

// Сэдвийн түлхүүр үгс
const topicKeywords = {
    emergency: ["яаралтай", "тусламж", "цагдаа", "түргэн", "гал", "sos", "emergency", "number"],
    transport: ["тээвэр", "метро", "автобус", "такси", "галт тэрэг", "явах", "унаа", "transport", "train", "bus", "taxi"],
    currency: ["мөнгө", "валют", "ханш", "currency", "money", "won", "yen", "baht"],
    greeting: ["хэллэг", "үг", "ярих", "мэндлэх", "phrases", "language", "hello"],
    tips: ["зөвлөгөө", "анхаарах", "tip", "advice", "guide"],
    esim: ["esim", "sim", "интернет", "дата", "data", "internet"],
};

export function generateLocalResponse(query: string, currentContextCountry?: string): string {
    const lowerQuery = query.toLowerCase();

    // 1. Улс тодорхойлох
    let targetCountrySlug = currentContextCountry;

    // Асуулт дотроос улсын нэр хайх
    for (const [keyword, slug] of Object.entries(countryKeywords)) {
        if (lowerQuery.includes(keyword)) {
            targetCountrySlug = slug;
            break;
        }
    }

    // Хэрэв улс олдвол мэдээллийн сангаас хайх
    if (targetCountrySlug && countryInfoDatabase[targetCountrySlug]) {
        const countryData = countryInfoDatabase[targetCountrySlug];
        return generateCountrySpecificResponse(lowerQuery, countryData);
    }

    // 2. eSIM асуултууд
    if (lowerQuery.includes("esim") || lowerQuery.includes("суулгах") || lowerQuery.includes("идэвхжүүлэх")) {
        return `📱 **eSIM суулгах заавар**

Та ямар утас ашиглаж байна вэ?
• iPhone
• Samsung
• Google Pixel
• Бусад Android

Утасныхаа загварыг бичвэл би яг таарсан зааврыг өгч чадна! 😊`;
    }

    // 3. Үнийн асуултууд
    if (lowerQuery.includes("үнэ") || lowerQuery.includes("хэд") || lowerQuery.includes("price") || lowerQuery.includes("cost")) {
        return `💰 **GateSIM үнийн мэдээлэл**

Манай багцууд маш хямд үнэтэй:
• 7 хоног, 5GB - ₮45,000-аас эхэлнэ
• 15 хоног, 10GB - ₮75,000-аас эхэлнэ
• 30 хоног, Unlimited - ₮120,000-аас эхэлнэ

Та аль улс руу явах гэж байна вэ? Би танд тохирох багцыг санал болгоё! 🌏`;
    }

    // 4. Хэрхэн ажилладаг
    if (lowerQuery.includes("яаж") || lowerQuery.includes("хэрхэн") || lowerQuery.includes("how") || lowerQuery.includes("ажилла")) {
        return `🔧 **eSIM хэрхэн ажилладаг вэ?**

1️⃣ Та манай сайтаас багц сонгоно
2️⃣ Төлбөр төлсний дараа QR код авна
3️⃣ Утсандаа QR кодыг scan хийнэ
4️⃣ Тэгээд л бэлэн! Интернэт ашиглаж эхэлнэ 🎉

Маш энгийн, 5 минутанд бүгд дуусна!`;
    }

    // 5. Ерөнхий мэндчилгээ
    if (lowerQuery.includes("сайн уу") || lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("мэнд")) {
        return `Сайн байна уу! 👋 Би GateSIM-ийн AI туслах.

Би танд дараах зүйлсээр тусалж чадна:
✈️ Аялалын зөвлөгөө (Япон, Солонгос, Тайланд)
📱 eSIM суулгах заавар
💰 Үнийн мэдээлэл
🌍 Улс орны мэдээлэл

Юу тусалж өгөх вэ? 😊`;
    }

    // Default response - илүү тусламжтай
    return `Би таны асуултыг ойлгохыг хичээж байна... 🤔

**Би дараах зүйлсээр тусалж чадна:**

🌏 **Улс орнууд:** Япон 🇯🇵, Солонгос 🇰🇷, Тайланд 🇹🇭
📱 **eSIM:** Суулгах заавар, идэвхжүүлэх
💰 **Үнэ:** Багцуудын үнийн мэдээлэл
🚇 **Тээвэр:** Метро, автобус, такси
💬 **Хэллэг:** Чухал үгс, хэллэгүүд

Жишээ асуултууд:
• "Японд метронд яаж суух вэ?"
• "eSIM хэрхэн суулгах вэ?"
• "Солонгосын багцын үнэ хэд вэ?"

Асуултаа дахин асуугаарай! 😊`;
}

function generateCountrySpecificResponse(query: string, data: CountryInfo): string {
    // Яаралтай тусламж
    if (topicKeywords.emergency.some(k => query.includes(k))) {
        return `${data.flag} **${data.name} улсын яаралтай тусламжийн дугаарууд:**

👮‍♂️ Цагдаа: **${data.emergencyNumbers.police}**
🚑 Түргэн тусламж: **${data.emergencyNumbers.ambulance}**
🚒 Гал команд: **${data.emergencyNumbers.fire}**

Танд яг одоо тусламж хэрэгтэй бол эдгээр дугаар руу үнэгүй залгах боломжтой.`;
    }

    // Тээвэр
    else if (topicKeywords.transport.some(k => query.includes(k))) {
        const transportList = data.transport.map(t => `• **${t.name}:** ${t.description} (Үнэ: ${t.priceRange || 'Тодорхойгүй'})`).join('\n');

        return `${data.flag} **${data.name} улсын нийтийн тээвэр:**

${transportList}

💡 **Зөвлөгөө:** ${data.transport[0]?.tips?.[0] || 'Түгжрэлээс сэргийлээрэй!'}`;
    }

    // Мөнгө / Валют
    else if (topicKeywords.currency.some(k => query.includes(k))) {
        const moneyTip = data.tips.find(t => t.category === "money")?.description || "Бэлэн мөнгө авч явахыг зөвлөж байна.";
        return `${data.flag} **${data.name} улсын валют:**

💰 **${data.currency} (${data.currencySymbol})**
1 ${data.currencySymbol} ≈ ... ханш өдөр бүр өөрчлөгдөнө.

💡 **Санхүүгийн зөвлөгөө:**
${moneyTip}`;
    }

    // Хэллэг
    else if (topicKeywords.greeting.some(k => query.includes(k))) {
        const phrases = data.phrases.slice(0, 3).map(p => `• ${p.phrase} (${p.pronunciation}) - ${p.meaning}`).join('\n');
        return `${data.flag} **${data.name} - Чухал хэллэгүүд:**

${phrases}

Эдгээр үгсийг мэдэхэд л та нутгийн хүмүүстэй ойлголцоход дөхөм болно! 👍`;
    }

    // Аялалын зөвлөгөө (Tips)
    else if (topicKeywords.tips.some(k => query.includes(k))) {
        const tips = data.tips.slice(0, 3).map(t => `✅ **${t.title}:** ${t.description}`).join('\n\n');
        return `${data.flag} **${data.name} аялалын зөвлөгөө:**

${tips}`;
    }

    return `${data.flag} **${data.name} (${data.nameMn})**

🏛️ Нийслэл: ${data.capital}
🗣️ Хэл: ${data.language}
💰 Валют: ${data.currency}
⏰ Цагийн бүс: ${data.timezone}

Та энэ улсын **тээвэр**, **яаралтай тусламж**, эсвэл **хэллэгийн** талаар дэлгэрэнгүй асууж болно.`;
}

export function findContextData(query: string, currentContextCountry?: string): string | null {
    const lowerQuery = query.toLowerCase();

    // 1. Улс тодорхойлох
    let targetCountrySlug = currentContextCountry;

    // Асуулт дотроос улсын нэр хайх
    for (const [keyword, slug] of Object.entries(countryKeywords)) {
        if (lowerQuery.includes(keyword)) {
            targetCountrySlug = slug;
            break;
        }
    }

    // Хэрэв улс олдвол тухайн улсын бүх мэдээллийг context болгож буцаах
    if (targetCountrySlug && countryInfoDatabase[targetCountrySlug]) {
        const data = countryInfoDatabase[targetCountrySlug];
        return JSON.stringify(data, null, 2);
    }

    return null;
}
