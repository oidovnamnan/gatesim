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

    // Filter logic: Include Regional now!
    // We want a mix of popular countries.
    // Let's deduplicate by country to show variety (1 per country)
    const featuredPackages: typeof allProducts = [];
    const seenCountries = new Set();

    // Sort by price first to get cheapest options
    const sortedProducts = allProducts.sort((a, b) => a.price - b.price);

    for (const p of sortedProducts) {
        // Must contain one of popular codes
        const relevantCode = popularCodes.find(code => p.countries.includes(code));
        if (relevantCode) {
            // New logic: Allow multiple per country if they are significantly different? 
            // For now, let's just take top 6 cheap ones that match our popular list, ensuring variety if possible.
            // Or just simple:
            if (featuredPackages.length >= 6) break;

            // Allow if it's regional OR if we haven't seen this country yet (for variety)
            // Actually, let's just fill 6 spots with bestsellers.
            if (!seenCountries.has(relevantCode) || p.isRegional) {
                featuredPackages.push(p);
                seenCountries.add(relevantCode);
            }
        }
    }

    // Fallback if not enough
    if (featuredPackages.length < 6) {
        const remaining = sortedProducts
            .filter(p => !featuredPackages.includes(p) && popularCodes.some(c => p.countries.includes(c)))
            .slice(0, 6 - featuredPackages.length);
        featuredPackages.push(...remaining);
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
