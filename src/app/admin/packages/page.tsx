import { getMobiMatterProducts } from "@/lib/mobimatter";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RefreshButton } from "@/components/admin/packages/refresh-button";

export default async function AdminPackagesPage() {
    const products = await getMobiMatterProducts();
    const USD_TO_MNT = 3450;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Packages Management ({products.length})</h1>
                    <p className="text-white/60">Manage your eSIM products and pricing</p>
                </div>
                <div className="flex gap-2">
                    <RefreshButton />
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Add Custom</Button>
                </div>
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <table className="w-full text-sm text-left text-white/80">
                    <thead className="bg-[#11141d] text-white font-medium border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4">SKU / Name</th>
                            <th className="px-6 py-4">Provider</th>
                            <th className="px-6 py-4">Data/Duration</th>
                            <th className="px-6 py-4">Cost (USD)</th>
                            <th className="px-6 py-4">Sell (MNT)</th>
                            <th className="px-6 py-4">Margin</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {products.map(p => {
                            const costUSD = p.originalPrice || 0;
                            const sellMNT = p.price; // This is already in MNT with margin applied from backend

                            // Estimate cost in MNT for margin calc (using standard rate if not provided)
                            // Ideally we should use the same rate as backend, but for display:
                            const costMNT = p.originalCurrency === 'MNT'
                                ? p.originalPrice || 0
                                : (p.originalPrice || 0) * USD_TO_MNT;

                            const profit = sellMNT - costMNT;
                            const margin = sellMNT > 0 ? (profit / sellMNT) * 100 : 0;

                            return (
                                <tr key={p.sku} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{p.name}</div>
                                        <div className="text-xs text-white/50 font-mono mt-1">{p.sku}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-white/5 border-white/10 text-white/70">
                                            {p.provider}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">
                                            {p.dataAmount === -1 ? "Unlimited" : (p.dataAmount / 1024).toFixed(0) + " GB"}
                                        </div>
                                        <div className="text-xs text-white/50">{p.durationDays} Days</div>
                                    </td>
                                    <td className="px-6 py-4 text-emerald-400 font-mono">${costUSD.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-bold text-white">{formatPrice(sellMNT, "MNT")}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={margin > 20 ? "success" : margin > 10 ? "warning" : "destructive"}>
                                                {margin.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-emerald-400/80 mt-1 font-mono">+{formatPrice(profit, "MNT")}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10">Active</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Edit</span>
                                            ✏️
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
