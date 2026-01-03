import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import PackageClient from "./package-client";
import { AmbienceTrigger } from "@/components/layout/ambience-trigger";
import { calculateSellPrice } from "@/lib/pricing-strategy";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const products = await getMobiMatterProducts();
    const pkg = products.find((p) => p.sku === id);

    if (!pkg) {
        return {
            title: "Багц олдсонгүй",
        };
    }

    return {
        title: `${pkg.name} - GateSIM`,
        description: `${pkg.dataAmount === -1 ? "Unlimited" : pkg.dataAmount + "MB"} data, ${pkg.durationDays} days validity`,
    };
}

export default async function PackagePage({ params }: Props) {
    const { id } = await params;
    const products = await getMobiMatterProducts();
    const pkg = products.find((p) => p.sku === id);

    if (!pkg) {
        redirect("/packages");
    }

    // Price is already calculated in MNT by getMobiMatterProducts (lib/mobimatter.ts)
    // No need to recalculate or apply exchange rate again.
    const sellPrice = pkg.price;

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

    const countryName = getCountryName(pkg.countries[0]);
    let title = pkg.name;
    // If title is just a country code (e.g. "AL"), use the full country name
    if (title.length === 2 && title === title.toUpperCase()) {
        title = countryName;
    }

    const clientPkg = {
        id: pkg.sku,
        title: title,
        operatorTitle: pkg.provider,
        data: pkg.dataAmount === -1 ? "Unlimited" : (pkg.dataAmount >= 1024 ? `${(pkg.dataAmount / 1024).toFixed(0)} GB` : `${pkg.dataAmount} MB`),
        validityDays: pkg.durationDays,
        price: sellPrice,
        currency: "MNT",
        countries: pkg.countries,
        countryName: countryName,
        // Ensuring all required fields for PackageClient
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
            <AmbienceTrigger countryCode={pkg.countries[0]} />
            <PackageClient pkg={clientPkg} />
        </>
    );
}
