import { Metadata } from "next";
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { AmbienceTrigger } from "@/components/layout/ambience-trigger";
import { PackageCard } from "@/components/packages/package-card";
import { MobileHeader } from "@/components/layout/mobile-header";

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
        };
        return names[c] || c;
    }

    const uiPackages = products.map(pkg => ({
        id: pkg.sku,
        title: pkg.name,
        operatorTitle: pkg.provider,
        data: pkg.dataAmount === -1 ? "Unlimited" : (pkg.dataAmount >= 1024 ? `${(pkg.dataAmount / 1024).toFixed(0)} GB` : `${pkg.dataAmount} MB`),
        validityDays: pkg.durationDays,
        price: pkg.price, // Already calculated in MNT
        currency: "MNT",
        countries: pkg.countries,
        countryName: getCountryName(pkg.countries[0]),
        isUnlimited: pkg.dataAmount === -1,
        isFeatured: false,
    }));

    return (
        <div className="min-h-screen pb-24">
            <AmbienceTrigger countryCode={code} />
            <MobileHeader title={`${getCountryName(code)}`} showBack />

            <div className="container max-w-7xl mx-auto p-4 space-y-4 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">
                        {getCountryName(code)} eSIM Багцууд
                    </h1>
                    <span className="text-xs md:text-sm text-muted-foreground">{uiPackages.length} багц</span>
                </div>

                {uiPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {uiPackages.map(pkg => (
                            <PackageCard key={pkg.id} {...pkg} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                        <div className="text-4xl">🏝</div>
                        <p>Энэ улсын багц одоогоор байхгүй байна.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
