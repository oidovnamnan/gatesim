import { getMobiMatterProducts } from "@/lib/mobimatter";
import { PackageCard } from "@/components/packages/package-card";
import * as motion from "framer-motion/client";

export async function FeaturedSection() {
    // Fetch data - this part is async and will be suspended
    const allProducts = await getMobiMatterProducts();

    const popularCodes = ["JP", "KR", "CN", "TH", "US", "SG", "VN", "TR"];
    const featuredPackages = allProducts
        .filter(p => !p.isRegional && popularCodes.some(code => p.countries.includes(code)))
        .sort((a, b) => a.price - b.price)
        .slice(0, 6);

    if (featuredPackages.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                Багц олдсонгүй.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {featuredPackages.map((pkg, index) => (
                <motion.div
                    key={pkg.sku}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                >
                    <PackageCard
                        id={pkg.sku}
                        title={pkg.name}
                        data={`${pkg.dataAmount > 0 ? (pkg.dataAmount / 1024).toFixed(1) + " GB" : "Unlimited"}`}
                        validityDays={pkg.durationDays}
                        price={pkg.price}
                        countryName={pkg.countries.join(", ")}
                        countries={pkg.countries}
                        operatorTitle={pkg.provider}
                        isFeatured={true}
                        className="bg-white/10 border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                    />
                </motion.div>
            ))}
        </div>
    );
}
