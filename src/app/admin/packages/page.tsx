
import { getMobiMatterProducts } from "@/lib/mobimatter";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "@/components/admin/packages/refresh-button";
import { getPricingSettings } from "@/lib/settings";
import PackagesTableClient from "@/components/admin/packages/packages-table-client"; // Changed to default import

export default async function AdminPackagesPage() {
    const products = await getMobiMatterProducts();
    const pricingSettings = await getPricingSettings(); // Fetched pricing settings

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        Packages Management
                        <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                            {products.length}
                        </span>
                    </h2>
                    <p className="text-slate-400">
                        Manage your eSIM products and pricing
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshButton /> {/* Kept RefreshButton */}
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Custom
                    </Button>
                </div>
            </div>

            <PackagesTableClient
                products={products}
                initialUsdToMnt={pricingSettings.usdToMnt}
            />
        </div>
    );
}
