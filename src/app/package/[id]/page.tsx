import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import PackageClient from "./package-client";
import { AmbienceTrigger } from "@/components/layout/ambience-trigger";
import { calculateSellPrice } from "@/lib/pricing-strategy";

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ country?: string }>;
}

import { getProductBySku } from "@/lib/products-db";

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { id: rawId } = await params;
    const { country } = await searchParams;

    // Decode ID to handle potential URL encoding
    const id = decodeURIComponent(rawId);

    // Try DB first
    let pkg = await getProductBySku(id);

    // Fallback to API cache
    if (!pkg) {
        const products = await getMobiMatterProducts();
        pkg = products.find((p) => p.sku === id) || null;
    }

    if (!pkg) {
        return {
            title: "Багц олдсонгүй",
        };
    }

    const countryCode = country?.toUpperCase() || pkg.countries[0];

    return {
        title: `${pkg.name} (${countryCode}) - GateSIM`,
        description: `${pkg.dataAmount === -1 ? "Unlimited" : pkg.dataAmount + "MB"} data, ${pkg.durationDays} days validity`,
    };
}

export default async function PackagePage({ params, searchParams }: Props) {
    const { id: rawId } = await params;
    const { country } = await searchParams;

    // Decode ID to handle potential URL encoding
    const id = decodeURIComponent(rawId);

    // 1. Try DB first (Fast & Consistent with the list)
    let pkg = await getProductBySku(id);

    // 2. Fallback to API cache
    if (!pkg) {
        console.log(`[PackagePage] ID ${id} not in DB, trying API cache`);
        const products = await getMobiMatterProducts();
        pkg = products.find((p) => p.sku === id) || null;
    }

    if (!pkg) {
        console.error(`[PackagePage] Product with ID ${id} not found in DB or API.`);
        redirect("/packages");
    }


    // Price is already calculated in MNT by getMobiMatterProducts (lib/mobimatter.ts)
    // No need to recalculate or apply exchange rate again.
    const sellPrice = pkg.price;

    const contextualCountry = country?.toUpperCase();
    const activeCountries = contextualCountry && pkg.countries.includes(contextualCountry)
        ? [contextualCountry, ...pkg.countries.filter(c => c !== contextualCountry)]
        : pkg.countries;

    // Helper to get country name
    const getCountryName = (code: string) => {
        const overrides: Record<string, string> = {
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
            "IT": "Итали",
            "ES": "Испани",
            "NL": "Нидерланд",
            "GB": "Их Британи",
            "EU": "Европ",
            "AL": "Албани",
            "AE": "Дубай (Арабын Нэгдсэн Эмират)",
        };

        if (overrides[code]) return overrides[code];

        try {
            const regionNames = new Intl.DisplayNames(['mn', 'en'], { type: 'region' });
            return regionNames.of(code) || code;
        } catch (e) {
            return code;
        }
    }

    const countryName = getCountryName(activeCountries[0]);
    let title = pkg.name;
    // If title is just a country code (e.g. "AL"), use the full country name
    if (title.length === 2 && title === title.toUpperCase()) {
        title = countryName;
    }

    // Enhanced title for regional packages if we have a context
    if (contextualCountry && pkg.countries.length > 1) {
        title = `${countryName} + ${pkg.countries.length - 1} улс`;
    }

    const clientPkg = {
        id: pkg.sku,
        title: title,
        operatorTitle: pkg.provider,
        data: pkg.dataAmount === -1 ? "Unlimited" : (pkg.dataAmount >= 1024 ? `${(pkg.dataAmount / 1024).toFixed(0)} GB` : `${pkg.dataAmount} MB`),
        validityDays: pkg.durationDays,
        price: sellPrice,
        currency: "MNT",
        countries: activeCountries,
        countryName: countryName,
        // Ensuring all required fields for PackageClient
        supportedCountries: activeCountries.map(c => ({
            code: c,
            name: getCountryName(c)
        })),
        isUnlimited: pkg.dataAmount === -1,
        isFeatured: pkg.countries.includes("CN") || pkg.provider.includes("Premium"),
        shortInfo: "eSIM QR код таны и-мэйл хаягаар 1-5 минутын дотор ирнэ. Та зөвхөн eSIM дэмждэг утастай байх шаардлагатай.",
        operatorInfo: [
            "4G/5G өндөр хурдны сүлжээ",
            "Хурдны хязгааргүй (High Speed)",
            "Hotspot цацах боломжтой",
            "Ашиглаж эхэлснээс хойш хугацаа тоологдоно"
        ]
    };

    return (
        <>
            <AmbienceTrigger countryCode={activeCountries[0]} />
            <PackageClient pkg={clientPkg} />
        </>
    );
}
