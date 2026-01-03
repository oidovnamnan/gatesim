import { getMobiMatterProducts } from "@/lib/mobimatter";
import { PackageCard } from "@/components/packages/package-card";
import * as motion from "framer-motion/client";

export async function FeaturedSection() {
    // Fetch data - this part is async and will be suspended
    const allProducts = await getMobiMatterProducts();

    const popularCodes = ["JP", "KR", "CN", "TH", "US", "SG", "VN", "TR", "EU"]; // Added EU

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

    // Curated Selection Logic
    const featuredPackages: typeof allProducts = [];
    const usedSkus = new Set<string>();

    const sortedByPop = allProducts.sort((a, b) => a.price - b.price);

    // 1. Force add 1 Europe Package
    const euPackage = sortedByPop.find(p => p.countries.includes("EU") || (p.countries.includes("FR") && p.countries.length > 5));
    if (euPackage) {
        featuredPackages.push(euPackage);
        usedSkus.add(euPackage.sku);
    }

    // 2. Force add 1 Multi-Country Asia Package
    const asiaCodes = ["SG", "TH", "MY", "ID", "VN", "PH"];
    const asiaPackage = sortedByPop.find(p =>
        !usedSkus.has(p.sku) &&
        p.countries.length > 3 &&
        asiaCodes.some(c => p.countries.includes(c))
    );
    if (asiaPackage) {
        featuredPackages.push(asiaPackage);
        usedSkus.add(asiaPackage.sku);
    }

    // 3. Fill the rest with Top Single Destinations
    const singleDestinations = ["JP", "KR", "CN", "US", "TR", "VN", "TH"];
    for (const code of singleDestinations) {
        if (featuredPackages.length >= 6) break;
        const pkg = sortedByPop.find(p =>
            !usedSkus.has(p.sku) &&
            p.countries.includes(code) &&
            p.countries.length === 1
        );
        if (pkg) {
            featuredPackages.push(pkg);
            usedSkus.add(pkg.sku);
        }
    }

    // 4. Fallback filler
    if (featuredPackages.length < 6) {
        const fillers = sortedByPop.filter(p =>
            !usedSkus.has(p.sku) &&
            popularCodes.some(c => p.countries.includes(c))
        ).slice(0, 6 - featuredPackages.length);
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
                            className="bg-white border-slate-100 shadow-sm md:bg-white/10 md:border-white/20"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
