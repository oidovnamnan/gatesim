export const siteConfig = {
    name: "GateSIM",
    description: "eSIM худалдааны платформ - Дэлхийн 200+ улсад хамгийн хямд үнээр",
    url: "https://gatesim.mn",
    ogImage: "https://gatesim.mn/og.jpg",

    links: {
        facebook: "https://facebook.com/gatesim",
        instagram: "https://instagram.com/gatesim",
    },

    contact: {
        email: "hello@gatesim.mn",
        phone: "+976 7777-1234",
    },

    company: {
        name: "GateSIM LLC",
        address: "Улаанбаатар хот",
    },
};

export const navItems = [
    {
        label: "Нүүр",
        href: "/",
        icon: "home"
    },
    {
        label: "Багцууд",
        href: "/packages",
        icon: "globe"
    },
    {
        label: "Миний eSIM",
        href: "/dashboard/orders",
        icon: "sim"
    },
    {
        label: "Профайл",
        href: "/dashboard",
        icon: "user"
    },
];

export const popularCountries = [
    { code: "JP", name: "Япон", flag: "🇯🇵" },
    { code: "KR", name: "Өмнөд Солонгос", flag: "🇰🇷" },
    { code: "CN", name: "Хятад", flag: "🇨🇳" },
    { code: "TH", name: "Тайланд", flag: "🇹🇭" },
    { code: "US", name: "Америк", flag: "🇺🇸" },
    { code: "SG", name: "Сингапур", flag: "🇸🇬" },
    { code: "MY", name: "Малайз", flag: "🇲🇾" },
    { code: "VN", name: "Вьетнам", flag: "🇻🇳" },
    { code: "TR", name: "Турк", flag: "🇹🇷" },
    { code: "AE", name: "Арабын Нэгдсэн Эмират", flag: "🇦🇪" },
    { code: "DE", name: "Герман", flag: "🇩🇪" },
    { code: "FR", name: "Франц", flag: "🇫🇷" },
];

export const regions = [
    { slug: "asia", name: "Ази", icon: "🌏" },
    { slug: "europe", name: "Европ", icon: "🌍" },
    { slug: "north-america", name: "Хойд Америк", icon: "🌎" },
    { slug: "south-america", name: "Өмнөд Америк", icon: "🌎" },
    { slug: "africa", name: "Африк", icon: "🌍" },
    { slug: "oceania", name: "Номхон далайн орнууд", icon: "🌏" },
    { slug: "global", name: "Дэлхий дахинд", icon: "🌐" },
];
