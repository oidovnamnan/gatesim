import { Suspense } from "react";
import HomeClient from "./home-client";
import { FeaturedSection } from "@/components/home/featured-section";
import { PackagesSkeleton } from "@/components/skeletons/packages-skeleton";

export default function HomePage() {
  // Page renders INSTANTLY now because we don't await anything here!

  return (
    <HomeClient>
      <Suspense fallback={<PackagesSkeleton />}>
        {/* The async component that fetches data */}
        <FeaturedSection />
      </Suspense>
    </HomeClient>
  );
}
