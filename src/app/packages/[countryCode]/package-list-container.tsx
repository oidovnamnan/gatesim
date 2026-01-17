
import { getProductsFromDB } from "@/lib/products-db";
import { CountryPackagesList } from "./country-packages-list";

interface Props {
    countryCode: string;
}

// Separate async component for data fetching to enable Streaming
export async function PackageListContainer({ countryCode }: Props) {
    // Fetch from Firestore DB (Fast & Reliable)
    const products = await getProductsFromDB({ countryCode });

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
        const otherCountries = pkg.countries.filter(c => c !== countryCode);
        const sortedCountries = [countryCode, ...otherCountries];

        const displayTitle = sortedCountries.length > 1
            ? `${getCountryName(countryCode)} + ${otherCountries.length} улс`
            : getCountryName(countryCode);

        // Calculate MB for consistency
        let dataDisplay = "0 MB";
        if (pkg.dataAmount === -1) {
            dataDisplay = "Unlimited";
        } else if (pkg.dataAmount >= 1024) {
            dataDisplay = `${(pkg.dataAmount / 1024).toFixed(0)} GB`;
        } else {
            dataDisplay = `${pkg.dataAmount} MB`;
        }

        return {
            id: pkg.sku,
            title: displayTitle,
            operatorTitle: pkg.provider,
            data: dataDisplay,
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

    return <CountryPackagesList packages={uiPackages} countryCode={countryCode} />;
}
