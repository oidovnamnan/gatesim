"use client";

import Link from "next/link";
import { CountryData } from "@/lib/utils";

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
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 h-full">
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">{country.flag}</div>
                <div className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-center">
                    {country.name}
                </div>
            </div>
        </Link>
    );
}
