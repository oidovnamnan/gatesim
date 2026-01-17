import { Metadata } from "next";
import { Suspense } from "react";
import { AmbienceTrigger } from "@/components/layout/ambience-trigger";
import { MobileHeader } from "@/components/layout/mobile-header";
import { PackageListContainer } from "./package-list-container";
import { PackagesSkeleton } from "@/components/skeletons/packages-skeleton";

interface Props {
    params: Promise<{ countryCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { countryCode } = await params;
    const code = countryCode.toUpperCase();
    return {
        title: `${code} eSIM Data Packages - GateSIM`,
    };
}

export default async function CountryPackagesPage({ params }: Props) {
    const { countryCode } = await params;
    const code = countryCode.toUpperCase();

    return (
        <div className="min-h-screen pb-24">
            <AmbienceTrigger countryCode={code} />
            <Suspense fallback={
                <div className="container mx-auto px-4 pt-20">
                    <PackagesSkeleton />
                </div>
            }>
                <PackageListContainer countryCode={code} />
            </Suspense>
        </div>
    );
}
