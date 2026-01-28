import { getMobiMatterProducts } from "@/lib/mobimatter";
import { PackageCard } from "@/components/packages/package-card";
import * as motion from "framer-motion/client";

export async function FeaturedSection() {
    // Fetch data - this part is async and will be suspended
    const allProducts = await getMobiMatterProducts();

    // Helper for names
    const getCountryName = (c: string) => {
        const names: Record<string, string> = {
            "JP": "Япон", "KR": "Солонгос", "CN": "Хятад", "TH": "Тайланд",
            "SG": "Сингапур", "VN": "Вьетнам", "TR": "Турк", "US": "Америк",
            "RU": "Орос", "KZ": "Казахстан", "EU": "Европ",
            "ID": "Индонез", "MY": "Малайз", "PH": "Филиппин"
        };
        return names[c] || c;
    }

    const sortedByPrice = [...allProducts].sort((a, b) => a.price - b.price);

    // Curated Selection Logic
    const featuredPackages: typeof allProducts = [];
    const usedSkus = new Set<string>();

    // Helper to add unique package
    const addPackage = (code: string, isSingle = true) => {
        const pkg = sortedByPrice.find(p =>
            !usedSkus.has(p.sku) &&
            p.countries.includes(code) &&
            (isSingle ? p.countries.length === 1 : p.countries.length > 1) &&
            !p.isTopUp
        );
        if (pkg) {
            featuredPackages.push(pkg);
            usedSkus.add(pkg.sku);
        }
    };

    // 1. Top 3 Most Popular (JP, KR, CN)
    ["JP", "KR", "CN"].forEach(code => addPackage(code));

    // 2. Europe Multi-country
    const euPackage = sortedByPrice.find(p =>
        !usedSkus.has(p.sku) &&
        (p.countries.includes("EU") || (p.countries.includes("FR") && p.countries.length > 5))
    );
    if (euPackage) {
        featuredPackages.push(euPackage);
        usedSkus.add(euPackage.sku);
    }

    // 3. Top Single Destinations
    ["TH", "US", "SG", "VN", "TR", "AE", "HK"].forEach(code => {
        if (featuredPackages.length < 10) addPackage(code);
    });

    // 4. Fill to 10 with any remaining popular items
    if (featuredPackages.length < 10) {
        const fillers = sortedByPrice.filter(p => !usedSkus.has(p.sku) && !p.isTopUp).slice(0, 10 - featuredPackages.length);
        featuredPackages.push(...fillers);
    }

    if (featuredPackages.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                Багц олдсонгүй.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {featuredPackages.map((pkg, index) => {
                const displayTitle = pkg.countries.length > 1
                    ? `${getCountryName(pkg.countries[0])} + ${pkg.countries.length - 1} улс`
                    : getCountryName(pkg.countries[0]);

                return (
                    <motion.div
                        key={pkg.sku}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <PackageCard
                            id={pkg.sku}
                            title={displayTitle}
                            data={`${pkg.dataAmount > -1 ? (pkg.dataAmount >= 1024 ? (pkg.dataAmount / 1024).toFixed(0) + " GB" : pkg.dataAmount + " MB") : "Unlimited"}`}
                            validityDays={pkg.durationDays}
                            price={pkg.price}
                            countryName={displayTitle}
                            countries={pkg.countries}
                            operatorTitle={pkg.provider}
                            isFeatured={true}
                            isTopUp={pkg.isTopUp}
                            className="bg-white border-slate-100 shadow-sm md:bg-white/10 md:border-white/20"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
