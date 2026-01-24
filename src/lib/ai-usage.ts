
import { prisma as db } from "@/lib/prisma";

export type AIUsageType = "PLAN" | "SCAN" | "TRANSIT" | "TRANSLATE" | "POSTER" | "MEDICAL";

const FREE_LIMITS = {
    PLAN: 3,
    SCAN: 3,
    TRANSIT: 3,
    TRANSLATE: 20,
    POSTER: 3,
    MEDICAL: 3
};

/**
 * Check if user can use AI feature.
 * Returns true if allowed, false if limit reached.
 */
export async function checkAILimit(userId: string, type: AIUsageType): Promise<boolean> {
    if (!userId) return false;

    try {
        const usage = await db.aiUsage.findUnique({
            where: { userId }
        });

        // If no usage record exists, they are free to use (will create record on use)
        if (!usage) return true;

        // 1. Check Premium Status
        if (usage.isPremium && usage.premiumExpiresAt && usage.premiumExpiresAt > new Date()) {
            return true; // Unlimited for premium
        }

        // 2. Check Free Limits
        switch (type) {
            case "PLAN": return usage.planCount < FREE_LIMITS.PLAN;
            case "SCAN": return usage.scanCount < FREE_LIMITS.SCAN;
            case "TRANSIT": return usage.transitCount < FREE_LIMITS.TRANSIT;
            case "TRANSLATE": return usage.translatorCount < FREE_LIMITS.TRANSLATE;
            case "POSTER": return usage.posterCount < FREE_LIMITS.POSTER;
            case "MEDICAL": return usage.medicalCount < FREE_LIMITS.MEDICAL;
            default: return false;
        }
    } catch (error) {
        console.error("AI Limit Check failed, allowing usage as fallback:", error);
        return true;
    }
}

/**
 * Increment usage counter.
 * Should be called AFTER successful AI generation.
 */
export async function incrementAIUsage(userId: string, type: AIUsageType) {
    if (!userId) return;

    try {
        await db.aiUsage.upsert({
            where: { userId },
            create: {
                userId,
                planCount: type === "PLAN" ? 1 : 0,
                scanCount: type === "SCAN" ? 1 : 0,
                transitCount: type === "TRANSIT" ? 1 : 0,
                translatorCount: type === "TRANSLATE" ? 1 : 0,
                posterCount: type === "POSTER" ? 1 : 0,
                medicalCount: type === "MEDICAL" ? 1 : 0,
            },
            update: {
                planCount: type === "PLAN" ? { increment: 1 } : undefined,
                scanCount: type === "SCAN" ? { increment: 1 } : undefined,
                transitCount: type === "TRANSIT" ? { increment: 1 } : undefined,
                translatorCount: type === "TRANSLATE" ? { increment: 1 } : undefined,
                posterCount: type === "POSTER" ? { increment: 1 } : undefined,
                medicalCount: type === "MEDICAL" ? { increment: 1 } : undefined,
            }
        });
    } catch (error) {
        console.error("Failed to increment AI usage:", error);
    }
}

/**
 * Activate Premium for a user.
 * Adds days to current expiry if already active, or starts new.
 */
export async function activatePremium(userId: string, days: number) {
    try {
        const usage = await db.aiUsage.findUnique({ where: { userId } });

        let newExpiry = new Date();

        // If already premium, extend from current expiry
        if (usage?.isPremium && usage.premiumExpiresAt && usage.premiumExpiresAt > new Date()) {
            newExpiry = new Date(usage.premiumExpiresAt);
        }

        // Add days
        newExpiry.setDate(newExpiry.getDate() + days);

        await db.aiUsage.upsert({
            where: { userId },
            create: {
                userId,
                isPremium: true,
                premiumExpiresAt: newExpiry
            },
            update: {
                isPremium: true,
                premiumExpiresAt: newExpiry
            }
        });
    } catch (error) {
        console.error("Failed to activate premium:", error);
    }
}

/**
 * Get current usage stats for UI
 */
export async function getAIStatus(userId: string) {
    try {
        const usage = await db.aiUsage.findUnique({ where: { userId } });

        const isPremium = usage?.isPremium && usage.premiumExpiresAt && usage.premiumExpiresAt > new Date();

        return {
            isPremium: !!isPremium,
            premiumExpiresAt: usage?.premiumExpiresAt,
            // Counts
            planCount: usage?.planCount || 0,
            scanCount: usage?.scanCount || 0,
            transitCount: usage?.transitCount || 0,
            translatorCount: usage?.translatorCount || 0,
            posterCount: usage?.posterCount || 0,
            medicalCount: usage?.medicalCount || 0,
            // Limits
            planLimit: FREE_LIMITS.PLAN,
            scanLimit: FREE_LIMITS.SCAN,
            transitLimit: FREE_LIMITS.TRANSIT,
            translatorLimit: FREE_LIMITS.TRANSLATE,
            posterLimit: FREE_LIMITS.POSTER,
            medicalLimit: FREE_LIMITS.MEDICAL,
            // Remaining
            remainingPlans: isPremium ? 9999 : Math.max(0, FREE_LIMITS.PLAN - (usage?.planCount || 0)),
            remainingScans: isPremium ? 9999 : Math.max(0, FREE_LIMITS.SCAN - (usage?.scanCount || 0)),
            remainingTransit: isPremium ? 9999 : Math.max(0, FREE_LIMITS.TRANSIT - (usage?.transitCount || 0)),
            remainingTranslator: isPremium ? 9999 : Math.max(0, FREE_LIMITS.TRANSLATE - (usage?.translatorCount || 0)),
            remainingPoster: isPremium ? 9999 : Math.max(0, FREE_LIMITS.POSTER - (usage?.posterCount || 0)),
            remainingMedical: isPremium ? 9999 : Math.max(0, FREE_LIMITS.MEDICAL - (usage?.medicalCount || 0)),
        };
    } catch (error) {
        console.error("Failed to get AI status:", error);
        return {
            isPremium: false,
            planCount: 0, scanCount: 0, transitCount: 0, translatorCount: 0, posterCount: 0, medicalCount: 0,
            planLimit: 3, scanLimit: 3, transitLimit: 3, translatorLimit: 20, posterLimit: 3, medicalLimit: 3,
            remainingPlans: 3, remainingScans: 3, remainingTransit: 3, remainingTranslator: 20, remainingPoster: 3, remainingMedical: 3
        };
    }
}
