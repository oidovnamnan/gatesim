import { prisma } from "@/lib/prisma";

export const PRICING_SETTINGS_KEY = 'pricing_config';

export const DEFAULT_PRICING = {
    usdToMnt: 3450,
    marginPercent: 25,
};

import { unstable_cache } from "next/cache";

export const getPricingSettings = unstable_cache(
    async function () {
        try {
            const setting = await prisma.setting.findUnique({
                where: { key: PRICING_SETTINGS_KEY },
            });

            if (!setting || !setting.value) {
                return DEFAULT_PRICING;
            }

            // Validate structure
            const val = setting.value as any;
            return {
                usdToMnt: Number(val.usdToMnt) || DEFAULT_PRICING.usdToMnt,
                marginPercent: Number(val.marginPercent) || DEFAULT_PRICING.marginPercent,
            };
        } catch (error) {
            console.error("Failed to load pricing settings from DB", error);
            return {
                ...DEFAULT_PRICING,
                // Fallback to env vars if DB fails
                usdToMnt: Number(process.env.USD_TO_MNT) || DEFAULT_PRICING.usdToMnt,
                marginPercent: Number(process.env.MARGIN_PERCENT) || DEFAULT_PRICING.marginPercent,
            };
        }
    },
    ['pricing-settings'],
    {
        revalidate: 3600, // Revalidate every 1 hour
        tags: ['pricing']
    }
);
