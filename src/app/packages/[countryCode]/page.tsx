import { Metadata } from "next";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { AmbienceTrigger } from "@/components/layout/ambience-trigger";
import { MobileHeader } from "@/components/layout/mobile-header";
import { CountryPackagesList } from "./country-packages-list";

interface Props {
    params: Promise<{ countryCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { countryCode } = await params;
    const code = countryCode.toUpperCase();
    return {
        title: `${code} eSIM Data Packages - GateSIM`,
    };
}

export default async function CountryPackagesPage({ params }: Props) {
    const { countryCode } = await params;
    const code = countryCode.toUpperCase();

    const allProducts = await getMobiMatterProducts();

    const products = allProducts.filter(p =>
        p.countries.includes(code)
    );

    const getCountryName = (c: string) => {
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
            "EU": "Европ",
            "AL": "Албани",
            "AE": "Дубай (Арабын Нэгдсэн Эмират)",
        };
        return names[c] || c;
    }

    const uiPackages = products.map(pkg => {
        const otherCountries = pkg.countries.filter(c => c !== code);
        const sortedCountries = [code, ...otherCountries];

        const displayTitle = sortedCountries.length > 1
            ? `${getCountryName(code)} + ${otherCountries.length} улс`
            : getCountryName(code);

        return {
            id: pkg.sku,
            title: displayTitle,
            operatorTitle: pkg.provider,
            data: pkg.dataAmount === -1 ? "Unlimited" : (pkg.dataAmount >= 1024 ? `${(pkg.dataAmount / 1024).toFixed(0)} GB` : `${pkg.dataAmount} MB`),
            validityDays: pkg.durationDays,
            price: pkg.price,
            currency: "MNT",
            countries: sortedCountries,
            countryName: displayTitle,
            isUnlimited: pkg.dataAmount === -1,
            isFeatured: sortedCountries.length > 1,
            isPopular: false
        };
    });

    return (
        <div className="min-h-screen pb-24">
            <AmbienceTrigger countryCode={code} />
            <MobileHeader title={`${getCountryName(code)}`} showBack />

            <div className="container max-w-7xl mx-auto p-4 space-y-4 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">
                        {getCountryName(code)} eSIM Багцууд
                    </h1>
                </div>

                <CountryPackagesList packages={uiPackages} />
            </div>
        </div>
    );
}
