// Centralized country name mappings
// Used across the application for consistent country name display

export const COUNTRY_NAMES: Record<string, string> = {
    // Asia
    "JP": "Япон",
    "KR": "Солонгос",
    "CN": "Хятад",
    "TH": "Тайланд",
    "SG": "Сингапур",
    "VN": "Вьетнам",
    "MY": "Малайз",
    "ID": "Индонез",
    "PH": "Филиппин",
    "TW": "Тайвань",
    "HK": "Хонг Конг",
    "MO": "Макао",
    "IN": "Энэтхэг",
    "PK": "Пакистан",
    "BD": "Бангладеш",
    "LK": "Шри Ланка",
    "NP": "Балба",
    "MN": "Монгол",
    "KZ": "Казахстан",
    "UZ": "Узбекистан",
    "KG": "Киргиз",
    "TJ": "Тажикстан",
    "AZ": "Азербайжан",
    "GE": "Гүрж",
    "AM": "Армен",

    // Middle East
    "AE": "ОАЭ",
    "SA": "Саудын Араб",
    "QA": "Катар",
    "KW": "Кувейт",
    "BH": "Бахрейн",
    "OM": "Оман",
    "IL": "Израиль",
    "TR": "Турк",
    "JO": "Иордан",
    "LB": "Ливан",

    // Europe
    "GB": "Их Британи",
    "DE": "Герман",
    "FR": "Франц",
    "IT": "Итали",
    "ES": "Испани",
    "PT": "Португал",
    "NL": "Нидерланд",
    "BE": "Бельги",
    "AT": "Австри",
    "CH": "Швейцар",
    "PL": "Польш",
    "CZ": "Чех",
    "HU": "Унгар",
    "RO": "Румын",
    "BG": "Болгар",
    "GR": "Грек",
    "SE": "Швед",
    "NO": "Норвеги",
    "DK": "Дани",
    "FI": "Финлянд",
    "IE": "Ирланд",
    "SK": "Словак",
    "SI": "Словен",
    "HR": "Хорват",
    "RS": "Серби",
    "UA": "Украин",
    "BY": "Беларусь",
    "RU": "Орос",
    "EE": "Эстон",
    "LV": "Латви",
    "LT": "Литва",

    // Americas
    "US": "Америк",
    "CA": "Канад",
    "MX": "Мексик",
    "BR": "Бразил",
    "AR": "Аргентин",
    "CL": "Чили",
    "CO": "Колумб",
    "PE": "Перу",
    "VE": "Венесуэл",
    "EC": "Эквадор",
    "UY": "Уругвай",
    "PY": "Парагвай",
    "BO": "Боливи",
    "CR": "Коста Рика",
    "PA": "Панам",
    "CU": "Куба",
    "DO": "Доминикан",
    "JM": "Ямайк",
    "PR": "Пуэрто Рико",

    // Oceania
    "AU": "Австрали",
    "NZ": "Шинэ Зеланд",
    "FJ": "Фижи",

    // Africa
    "ZA": "Өмнөд Африк",
    "EG": "Египет",
    "MA": "Марокко",
    "NG": "Нигери",
    "KE": "Кени",
    "TZ": "Танзани",
    "ET": "Этиоп",
    "GH": "Гана",

    // Regional
    "EU": "Европ",
    "ASIA": "Ази",
    "GLOBAL": "Дэлхий",
};

/**
 * Get localized country name by ISO code
 * @param code - ISO 3166-1 alpha-2 country code (e.g., "JP", "KR")
 * @returns Mongolian country name or original code if not found
 */
export function getCountryName(code: string): string {
    if (!code) return "Тодорхойгүй";
    const upperCode = code.toUpperCase();
    return COUNTRY_NAMES[upperCode] || code;
}

/**
 * Get country flag emoji by ISO code
 * @param code - ISO 3166-1 alpha-2 country code
 * @returns Flag emoji or globe emoji if not found
 */
export function getCountryFlag(code: string): string {
    if (!code || code.length !== 2) return "🌍";
    const upperCode = code.toUpperCase();
    // Convert country code to flag emoji using regional indicator symbols
    const codePoints = [...upperCode].map(
        char => 0x1F1E6 + char.charCodeAt(0) - 65
    );
    return String.fromCodePoint(...codePoints);
}

/**
 * Get both flag and name for display
 * @param code - ISO 3166-1 alpha-2 country code
 * @returns Object with flag and name
 */
export function getCountryDisplay(code: string): { flag: string; name: string } {
    return {
        flag: getCountryFlag(code),
        name: getCountryName(code),
    };
}
