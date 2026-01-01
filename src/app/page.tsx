"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Sparkles
} from "lucide-react";
import { PackageCard } from "@/components/packages/package-card";
import { AIChat } from "@/components/ai/ai-chat";
import { popularCountries } from "@/config/site";
import { Globe } from "@/components/ui/globe";

// Featured packages for homepage display
const featuredPackages = [
  { id: "cn-7d-5gb", title: "China 5GB", operatorTitle: "China Unicom", data: "5 GB", validityDays: 7, price: 28900, countries: ["CN"], countryName: "Хятад", isFeatured: true },
  { id: "jp-7d-3gb", title: "Japan 3GB", operatorTitle: "SoftBank", data: "3 GB", validityDays: 7, price: 21500, countries: ["JP"], countryName: "Япон", isPopular: true },
  { id: "kr-7d-5gb", title: "Korea 5GB", operatorTitle: "SK Telecom", data: "5 GB", validityDays: 7, price: 24800, countries: ["KR"], countryName: "Солонгос", isPopular: true },
  { id: "th-15d-10gb", title: "Thailand 10GB", operatorTitle: "AIS", data: "10 GB", validityDays: 15, price: 32500, countries: ["TH"], countryName: "Тайланд", isFeatured: true },
  { id: "sg-10d-5gb", title: "Singapore 5GB", operatorTitle: "Singtel", data: "5 GB", validityDays: 10, price: 29900, countries: ["SG"], countryName: "Сингапур" },
  { id: "us-30d-10gb", title: "USA 10GB", operatorTitle: "T-Mobile", data: "10 GB", validityDays: 30, price: 55000, countries: ["US"], countryName: "Америк", isFeatured: true },
  { id: "tr-15d-10gb", title: "Turkey 10GB", operatorTitle: "Turkcell", data: "10 GB", validityDays: 15, price: 38500, countries: ["TR"], countryName: "Турк" },
  { id: "vn-7d-5gb", title: "Vietnam 5GB", operatorTitle: "Viettel", data: "5 GB", validityDays: 7, price: 18500, countries: ["VN"], countryName: "Вьетнам", isPopular: true },
];

// Floating Card color schemes
const countryThemes: Record<string, {
  badgeBg: string,
  badgeText: string,
  hoverShadow: string
}> = {
  "CN": {
    badgeBg: "bg-gradient-to-r from-red-500 to-red-600",
    badgeText: "text-white",
    hoverShadow: "hover:shadow-red-500/20"
  },
  "JP": {
    badgeBg: "bg-gradient-to-r from-pink-500 to-pink-600",
    badgeText: "text-white",
    hoverShadow: "hover:shadow-pink-500/20"
  },
  "KR": {
    badgeBg: "bg-gradient-to-r from-blue-500 to-blue-600",
    badgeText: "text-white",
    hoverShadow: "hover:shadow-blue-500/20"
  },
  "TH": {
    badgeBg: "bg-gradient-to-r from-amber-500 to-amber-600",
    badgeText: "text-white",
    hoverShadow: "hover:shadow-amber-500/20"
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 overflow-x-hidden font-sans relative">
      {/* TopHeader is now in layout.tsx */}

      {/* COBE 3D GLOBE */}
      <div className="fixed top-[-80px] right-[-300px] md:top-[-150px] md:right-[-400px] z-0 pointer-events-none opacity-80">
        <div className="md:hidden">
          <Globe size={750} />
        </div>
        <div className="hidden md:block">
          <Globe size={1400} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--background))]/40 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))]/40 via-transparent to-transparent"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 lg:px-12 pt-28 md:pt-40 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-full md:w-1/2 md:pr-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-left relative z-20">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[hsl(var(--foreground))] leading-[1.1] tracking-tight mb-6 drop-shadow-sm">
                Your Gateway to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
                  Global Connection
                </span>
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] text-base md:text-xl font-medium max-w-md leading-relaxed">
                Дэлхийн 200+ улсад хамгийн хямд үнээр<br className="hidden md:block" />интернэтэд холбогдоорой.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10 max-w-lg relative z-30">
              <Link href="/packages">
                <div className="relative rounded-3xl flex items-center shadow-[0_8px_32px_0_rgba(185,28,28,0.05)] backdrop-blur-md border border-white/40 cursor-pointer overflow-hidden py-4 pl-4 pr-3 transition-all hover:scale-[1.01] group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl pointer-events-none"></div>
                  <div className="relative z-10 w-8 h-8 rounded-full border border-red-400/30 flex items-center justify-center flex-shrink-0 bg-red-50/30 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                  </div>
                  <div className="relative z-10 flex-1 ml-4 text-[hsl(var(--foreground))] text-base font-semibold group-hover:text-red-600 transition-colors">Таны очих газар...</div>
                  <div className="relative z-10 bg-white/20 p-2.5 rounded-2xl shadow-sm border border-white/30 backdrop-blur-sm">
                    <Search className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4 mb-16 max-w-sm relative z-30">
              <div className="flex-1 flex items-center justify-center py-4 rounded-[20px] bg-gradient-to-b from-red-600/90 to-red-700/90 backdrop-blur-md text-white shadow-lg shadow-red-600/20 cursor-pointer hover:shadow-red-600/40 transition active:scale-95 border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                <span className="text-base font-bold relative z-10">7 хоног</span>
              </div>
              <div className="flex-1 flex items-center justify-center py-4 rounded-[20px] bg-white/10 backdrop-blur-md border border-white/30 text-slate-800 font-bold cursor-pointer hover:bg-white/20 transition active:scale-95 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                <span className="text-base relative z-10">15 хоног</span>
              </div>
            </motion.div>
          </div>

          <div className="hidden md:block w-1/2"></div>
        </div>
      </div>

      {/* Popular Countries - FLOATING CARD DESIGN */}
      <section className="container mx-auto px-6 lg:px-12 mt-4 md:mt-12 mb-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularCountries.slice(0, 4).map((country, index) => {
            const theme = countryThemes[country.code] || countryThemes["CN"];

            return (
              <Link key={country.code} href={`/packages/${country.code}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative rounded-3xl p-5 
                                bg-white/80 backdrop-blur-xl
                                border border-white/60
                                shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)]
                                ${theme.hoverShadow}
                                transition-all duration-500 cursor-pointer
                                flex flex-col items-center text-center min-h-[180px]`}
                >
                  {/* Floating Price Badge */}
                  <div className={`absolute top-3 right-3 ${theme.badgeBg} ${theme.badgeText} px-3 py-1 rounded-full text-xs font-black shadow-lg`}>
                    ₮45k
                  </div>

                  {/* Large Flag */}
                  <div className="mt-2 mb-4">
                    <span className="text-5xl drop-shadow-lg filter brightness-95 group-hover:brightness-100 group-hover:scale-110 inline-block transition-all duration-300">
                      {country.flag}
                    </span>
                  </div>

                  {/* Country Name */}
                  <h3 className="text-xl font-black text-[hsl(var(--card-foreground))] leading-tight mb-2 line-clamp-1 w-full px-2">
                    {country.name}
                  </h3>

                  {/* Specs */}
                  <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--muted-foreground))] mt-auto">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg">5GB</span>
                    <span className="text-slate-400">•</span>
                    <span className="bg-slate-100 px-2.5 py-1 rounded-lg">7 хоног</span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Packages */}
      <section className="container mx-auto px-6 lg:px-12 pb-20 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-50/50 backdrop-blur-sm p-2.5 rounded-2xl shadow-sm border border-red-100/50">
            <Sparkles className="w-5 h-5 text-red-600 fill-red-500" />
          </div>
          <h2 className="text-2xl font-black text-[hsl(var(--foreground))] tracking-tight drop-shadow-sm">Онцлох багцууд</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <PackageCard
                {...pkg}
                className="bg-white/10 border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="container mx-auto px-6 lg:px-12 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* AI Icon */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl shadow-red-500/30">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                AI Туслах 🤖
              </h2>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
                Хаашаа явахаа хэлээд л, танд хамгийн тохиромжтой багцыг санал болгоно.
                <br className="hidden md:block" />
                <span className="text-slate-400">"Япон руу 2 долоо хоног" гэхэд л болно!</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">💬 Монгол хэлээр</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">⚡ Шуурхай хариу</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">🎯 Хувийн зөвлөгөө</span>
              </div>
            </div>

            {/* CTA - Opens AI Chat */}
            <div className="flex-shrink-0">
              <p className="text-xs text-slate-400 mb-2 text-center">Баруун доод буланд</p>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <AIChat />
    </div>
  );
}
