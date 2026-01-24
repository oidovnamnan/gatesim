
import { prisma as db } from "@/lib/prisma";

export type AIUsageType = "PLAN" | "SCAN";

const FREE_LIMITS = {
    PLAN: 3,
    SCAN: 3
};

/**
 * Check if user can use AI feature.
 * Returns true if allowed, false if limit reached.
 */
export async function checkAILimit(userId: string, type: AIUsageType): Promise<boolean> {
    if (!userId) return false;

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
    if (type === "PLAN") {
        return usage.planCount < FREE_LIMITS.PLAN;
    } else {
        return usage.scanCount < FREE_LIMITS.SCAN;
    }
}

/**
 * Increment usage counter.
 * Should be called AFTER successful AI generation.
 */
export async function incrementAIUsage(userId: string, type: AIUsageType) {
    if (!userId) return;

    await db.aiUsage.upsert({
        where: { userId },
        create: {
            userId,
            planCount: type === "PLAN" ? 1 : 0,
            scanCount: type === "SCAN" ? 1 : 0
        },
        update: {
            planCount: type === "PLAN" ? { increment: 1 } : undefined,
            scanCount: type === "SCAN" ? { increment: 1 } : undefined
        }
    });
}

/**
 * Activate Premium for a user.
 * Adds days to current expiry if already active, or starts new.
 */
export async function activatePremium(userId: string, days: number) {
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
}

/**
 * Get current usage stats for UI
 */
export async function getAIStatus(userId: string) {
    const usage = await db.aiUsage.findUnique({ where: { userId } });

    const isPremium = usage?.isPremium && usage.premiumExpiresAt && usage.premiumExpiresAt > new Date();

    return {
        isPremium: !!isPremium,
        premiumExpiresAt: usage?.premiumExpiresAt,
        planCount: usage?.planCount || 0,
        scanCount: usage?.scanCount || 0,
        planLimit: FREE_LIMITS.PLAN,
        scanLimit: FREE_LIMITS.SCAN,
        remainingPlans: isPremium ? 9999 : Math.max(0, FREE_LIMITS.PLAN - (usage?.planCount || 0)),
        remainingScans: isPremium ? 9999 : Math.max(0, FREE_LIMITS.SCAN - (usage?.scanCount || 0)),
    };
}
