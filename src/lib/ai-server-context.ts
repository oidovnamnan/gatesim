import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export interface UserTravelContext {
    isAuthenticated: boolean;
    userName?: string;
    activePlan?: {
        id: string;
        provider: string; // e.g., 'Nomad', 'Airalo'
        country: string; // e.g., 'Japan', 'South Korea'
        countryCode: string; // e.g., 'JP', 'KR'
        dataTotal: string; // e.g., '10GB'
        dataRemaining?: string; // Placeholder for real-time usage if available
        expiryDate: Date;
        daysRemaining: number;
    };
    hasActiveOrder: boolean;
}

export async function getUserTravelContext(): Promise<UserTravelContext> {
    const session = await auth();

    if (!session?.user?.email) {
        return {
            isAuthenticated: false,
            hasActiveOrder: false
        };
    }

    // Fetch user and their latest active paid order
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            name: true,
            email: true,
            orders: {
                where: {
                    status: "PAID",
                    // Simple check: Created within last 30 days (assuming max plan is 30 days for now)
                    // In a real scenario, we would check the specific package duration
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { createdAt: "desc" },
                take: 1,
                include: {
                    package: true
                }
            }
        }
    });

    if (!user) {
        return {
            isAuthenticated: true,
            hasActiveOrder: false
        };
    }

    const latestOrder = user.orders[0];

    if (!latestOrder || !latestOrder.package) {
        return {
            isAuthenticated: true,
            userName: user.name || undefined,
            hasActiveOrder: false
        };
    }

    const pkg = latestOrder.package;

    // Calculate days remaining
    const expiryDate = new Date(latestOrder.createdAt);
    expiryDate.setDate(expiryDate.getDate() + (pkg.validityDays || 30));
    const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Safely extract country code from countries array causing no error if empty
    const countryCode = pkg.countries && pkg.countries.length > 0 ? pkg.countries[0] : "JP";

    return {
        isAuthenticated: true,
        userName: user.name || undefined,
        hasActiveOrder: true,
        activePlan: {
            id: latestOrder.id,
            provider: pkg.operatorTitle || "GateSIM",
            country: pkg.countryName || "Unknown Country",
            countryCode: countryCode,
            dataTotal: pkg.data || "Unknown GB",
            expiryDate: expiryDate,
            daysRemaining: daysRemaining
        }
    };
}
