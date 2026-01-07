import { NextRequest, NextResponse } from "next/server";
import { airalo } from "@/services/airalo";

// GET /api/packages - List packages
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const country = searchParams.get("country");
        const type = searchParams.get("type"); // local, global
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");

        let response;

        if (country) {
            // Get packages for specific country
            response = await airalo.getCountryPackages(country);
        } else if (type === "global") {
            // Get global/regional packages
            response = await airalo.getGlobalPackages();
        } else {
            // Get all packages with pagination
            response = await airalo.getAllPackages({ page, limit });
        }

        // Transform packages for frontend
        const packages = response.data.map((pkg) => ({
            id: pkg.package_id,
            airaloPackageId: pkg.package_id,
            slug: pkg.slug,
            type: pkg.type,
            title: pkg.title,
            data: pkg.data,
            dataAmount: pkg.amount,
            validityDays: pkg.day,
            isUnlimited: pkg.is_unlimited,
            netPrice: pkg.net_price,
            retailPrice: pkg.price,
            ourPrice: calculateOurPrice(pkg.net_price),
            operatorTitle: pkg.operator.title,
            isRoaming: pkg.operator.is_roaming,
            operatorInfo: pkg.operator.info,
            countries: pkg.countries,
            planType: pkg.plan_type,
            activationPolicy: pkg.activation_policy,
            shortInfo: pkg.short_info,
        }));

        return NextResponse.json({
            packages,
            pagination: response.meta
                ? {
                    page: response.meta.current_page,
                    limit: response.meta.per_page,
                    total: response.meta.total,
                    totalPages: response.meta.last_page,
                }
                : null,
        });
    } catch (error) {
        console.error("Error fetching packages:", error);

        return NextResponse.json(
            { error: "Failed to fetch packages" },
            { status: 500 }
        );
    }
}

// Calculate our selling price (add margin)
function calculateOurPrice(netPrice: number, marginPercent: number = 25): number {
    return Math.round((netPrice * (1 + marginPercent / 100)) * 100) / 100;
}
