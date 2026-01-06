"use client";

import Link from "next/link";
import { SimCardFlag } from "@/components/ui/sim-card-flag";

export interface CountryData {
    code: string;
    name: string;
    flag: string;
}

export function CountryList({ countries }: { countries: CountryData[] }) {
    return (
        <div className="grid grid-cols-4 gap-3">
            {countries.map((country) => (
                <CountryCard key={country.code} country={country} />
            ))}
        </div>
    );
}

export function CountryCard({ country }: { country: CountryData }) {
    return (
        <Link href={`/packages/${country.code}`} className="block group">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-red-300 dark:hover:border-red-500 transition-all duration-300 h-full">
                <div className="mb-2 transform group-hover:scale-110 transition-transform">
                    <SimCardFlag countryCode={country.code} size="sm" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors text-center">
                    {country.name}
                </div>
            </div>
        </Link>
    );
}
