import { redirect } from "next/navigation";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { getProductBySku } from "@/lib/products-db";
import CheckoutClient from "./checkout-client";

interface Props {
    searchParams: Promise<{ package?: string; country?: string }>;
}

function formatDataAmount(mb: number): string {
    if (mb === -1) return "Unlimited";
    if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
    return `${mb} MB`;
}

function getCountryName(code: string): string {
    const names: Record<string, string> = {
        "JP": "Япон",
        "KR": "Солонгос",
        "CN": "Хятад",
        "TH": "Тайланд",
        "SG": "Сингапур",
        "VN": "Вьетнам",
        "TR": "Турк",
        "US": "Америк",
        "RU": "Орос",
        "KZ": "Казахстан",
        "DE": "Герман",
        "FR": "Франц",
        "GB": "Их Британи",
        "IT": "Итали",
        "ES": "Испани",
        "AE": "Дубай",
        "HK": "Хонг Конг",
        "TW": "Тайвань",
        "MO": "Макао",
        "MY": "Малайз",
        "ID": "Индонези",
        "PH": "Филиппин",
        "AU": "Австрали",
        "CA": "Канад"
    };
    return names[code.toUpperCase()] || code;
}

export default async function CheckoutPage({ searchParams }: Props) {
    const { package: packageId, country } = await searchParams;

    if (!packageId) {
        redirect("/packages");
    }

    // 1. Try DB first (fast)
    let p = await getProductBySku(packageId);

    // 2. Fallback to API if not in DB
    if (!p) {
        console.log("[Checkout] Package not in DB, falling back to API:", packageId);
        const products = await getMobiMatterProducts();
        p = products.find(prod => prod.sku === packageId) || null;
    }

    if (!p) {
        redirect("/packages");
    }

    // Price is already calculated in MNT
    const sellPrice = p.price;

    const contextualCountry = country?.toUpperCase();
    const activeCountries = contextualCountry && p.countries.includes(contextualCountry)
        ? [contextualCountry, ...p.countries.filter(c => c !== contextualCountry)]
        : p.countries;

    const pkg = {
        id: p.sku,
        title: p.name,
        operatorTitle: p.provider,
        data: formatDataAmount(p.dataAmount),
        validityDays: p.durationDays,
        price: sellPrice,
        currency: "MNT",
        countries: activeCountries,
        countryName: getCountryName(activeCountries[0]),
    };

    // If it's a regional package and we have a context, update title to match
    if (contextualCountry && p.countries.length > 1) {
        pkg.title = `${pkg.countryName} + ${p.countries.length - 1} улс`;
    }

    return <CheckoutClient pkg={pkg} />;
}
