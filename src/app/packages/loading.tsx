import { PackagesSkeleton } from "@/components/skeletons/packages-skeleton";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function PackagesLoading() {
    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <div className="md:hidden">
                <MobileHeader title="..." showBack />
            </div>
            <div className="container mx-auto px-4 pt-4 md:pt-8">
                <PackagesSkeleton />
            </div>
        </div>
    );
}
