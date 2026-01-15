"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Globe
} from "lucide-react";
import { MobiMatterProduct } from "@/lib/mobimatter";
import { formatPrice } from "@/lib/utils";
import { RefreshButton } from "@/components/admin/packages/refresh-button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PackagesTableClientProps {
    products: MobiMatterProduct[];
    initialUsdToMnt: number;
}

type SortKey = "price" | "cost" | "margin" | "data" | "duration";
type SortDirection = "asc" | "desc";

export default function PackagesTableClient({ products, initialUsdToMnt }: PackagesTableClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [providerFilter, setProviderFilter] = useState("all");
    const [regionFilter, setRegionFilter] = useState("all");
    const [deduplicateFilter, setDeduplicateFilter] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    // Get unique providers for filter
    const providers = useMemo(() => {
        const unique = new Set(products.map(p => p.provider));
        return Array.from(unique).sort();
    }, [products]);

    // Filter and Sort Logic
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                p.provider.toLowerCase().includes(query) ||
                p.countries.some(c => c.toLowerCase().includes(query))
            );
        }

        // 2. Filter by Provider
        if (providerFilter !== "all") {
            result = result.filter(p => p.provider === providerFilter);
        }

        // 3. Filter by Region
        if (regionFilter !== "all") {
            if (regionFilter === "regional") {
                result = result.filter(p => p.isRegional);
            } else if (regionFilter === "single") {
                result = result.filter(p => !p.isRegional);
            }
        }

        // 4. Deduplicate: Group by countries+data+duration, keep cheapest
        if (deduplicateFilter) {
            const groups = new Map<string, typeof result[0]>();
            result.forEach(pkg => {
                const key = `${[...pkg.countries].sort().join(',')}-${pkg.dataAmount}-${pkg.durationDays}`;
                const existing = groups.get(key);
                if (!existing || pkg.price < existing.price) {
                    groups.set(key, pkg);
                }
            });
            result = Array.from(groups.values());
        }

        // 4. Sort
        if (sortConfig) {
            result.sort((a, b) => {
                let aValue: number = 0;
                let bValue: number = 0;

                switch (sortConfig.key) {
                    case "price":
                        aValue = a.price;
                        bValue = b.price;
                        break;
                    case "cost":
                        // Normalize to USD for sorting if possible, or just raw value
                        aValue = a.originalCurrency === 'USD' ? (a.originalPrice || 0) : 0;
                        bValue = b.originalCurrency === 'USD' ? (b.originalPrice || 0) : 0;
                        break;
                    case "margin":
                        // Calculate profit amount
                        const aCostMnt = a.originalCurrency === 'USD' ? (a.originalPrice || 0) * initialUsdToMnt : 0;
                        const bCostMnt = b.originalCurrency === 'USD' ? (b.originalPrice || 0) * initialUsdToMnt : 0;
                        aValue = a.price - aCostMnt;
                        bValue = b.price - bCostMnt;
                        break;
                    case "data":
                        aValue = a.dataAmount;
                        bValue = b.dataAmount;
                        break;
                    case "duration":
                        aValue = a.durationDays;
                        bValue = b.durationDays;
                        break;
                }

                if (sortConfig.direction === "asc") {
                    return aValue - bValue;
                } else {
                    return bValue - aValue;
                }
            });
        }

        return result;
    }, [products, searchQuery, providerFilter, regionFilter, deduplicateFilter, sortConfig, initialUsdToMnt]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
    const paginatedProducts = filteredAndSortedProducts.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // Handlers
    const handleSort = (key: SortKey) => {
        let direction: SortDirection = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const formatData = (mb: number) => {
        if (mb === -1) return "Unlimited";
        if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
        return `${mb} MB`;
    };

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            {/* Filters Bar */}
            <div className="flex flex-col gap-2 bg-white dark:bg-slate-900/50 p-2 md:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <div className="w-full relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Search by name, SKU, country..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-2 w-full">
                    {/* Selects Row */}
                    <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                        <Select value={providerFilter} onValueChange={(v) => { setProviderFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-full md:w-[140px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                                <SelectValue placeholder="Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Providers</SelectItem>
                                {providers.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-full md:w-[140px] h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                                <SelectValue placeholder="Region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                <SelectItem value="single">Single Country</SelectItem>
                                <SelectItem value="regional">Regional / Global</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Buttons Row / Area */}
                    <div className="grid grid-cols-1 md:flex gap-2 md:w-auto">
                        <Button
                            variant={deduplicateFilter ? "default" : "outline"}
                            onClick={() => { setDeduplicateFilter(!deduplicateFilter); setPage(1); }}
                            className={`h-10 w-full md:w-auto px-4 ${deduplicateFilter
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                        >
                            Давхардалгүй
                        </Button>

                        {/* Mobile only: Hidden on desktop to avoid duplication if header has it, but shown here for filter context if needed. 
                            However, user complained about 'empty button'. 
                            If RefreshButton renders just an icon or empty on mobile, checking its code... 
                            It renders text "Sync from MobiMatter", but maybe it was squeezed?
                            Let's hide it on mobile if it's redundant or broken, or ensure it's full width.
                            User said "empty button like thing" (цагаан хоосон товч шиг зүйл).
                            If the RefreshButton component has className="h-10 gap-2", maybe it had no content or failed to render text?
                            Actually, I will remove it from here if it's already in the header (which it is in page.tsx).
                            Wait, page.tsx has it. So this might be duplicate.
                            Let's remove it from the filter bar to clean up mobile view.
                        */}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredAndSortedProducts.length} packages
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">SKU / Name</th>
                                <th className="px-4 py-3 font-medium">Provider</th>
                                <th onClick={() => handleSort('data')} className="px-4 py-3 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white">
                                    <div className="flex items-center gap-1">
                                        Data
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('cost')} className="px-4 py-3 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white">
                                    <div className="flex items-center gap-1">
                                        Cost
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('price')} className="px-4 py-3 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white">
                                    <div className="flex items-center gap-1">
                                        Sell
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('margin')} className="px-4 py-3 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white">
                                    <div className="flex items-center gap-1">
                                        Margin
                                        <ArrowUpDown className="w-3 h-3" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedProducts.map((p) => {
                                const costUSD = p.originalPrice || 0;
                                const sellMNT = p.price;
                                // Dynamic cost calculation for margin logic (approximate for display if not USD)
                                const costMNT = p.originalCurrency === 'USD'
                                    ? costUSD * initialUsdToMnt
                                    : (p.originalCurrency === 'MNT' ? p.originalPrice || 0 : 0);

                                const profitMNT = costMNT > 0 ? sellMNT - costMNT : 0;
                                const marginPercent = costMNT > 0 ? ((sellMNT - costMNT) / costMNT) * 100 : 0;

                                return (
                                    <tr key={p.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <div className="font-bold text-slate-900 dark:text-white mb-0.5 truncate" title={p.name}>{p.name}</div>
                                            <div className="font-mono text-[10px] text-slate-500 truncate" title={p.sku}>{p.sku}</div>
                                            {p.isRegional && (
                                                <Badge variant="outline" className="mt-1 text-[10px] border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 py-0 h-4">
                                                    Regional
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 pointer-events-none text-[10px] px-1.5 h-5">
                                                {p.provider}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-700 dark:text-slate-200 text-xs">
                                                {formatData(p.dataAmount)}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-white/50">{p.durationDays} Days</div>
                                        </td>
                                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                                            {p.originalPrice?.toLocaleString()} <span className="text-[10px] text-slate-400 dark:text-white/50">{p.originalCurrency}</span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-xs">
                                            {formatPrice(sellMNT, "MNT")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 border-0 text-[10px] px-1.5 h-5">
                                                    {marginPercent.toFixed(1)}%
                                                </Badge>
                                                {profitMNT > 0 && (
                                                    <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-mono">
                                                        +{formatPrice(profitMNT, "MNT")}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500 my-auto" title="Active"></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    Previous
                </Button>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Page {page} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
