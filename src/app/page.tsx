import { getMobiMatterProducts } from "@/lib/mobimatter";
import HomeClient from "./home-client";

// This is a Server Component
export default async function HomePage() {
  // Fetch products directly from MobiMatter API
  const allProducts = await getMobiMatterProducts();

  // Filter for "Featured" packages logic
  // For now, let's pick some reasonable defaults or popular destinations for the featured section
  // e.g., Japan, Korea, China, Thailand, USA, Singapore, Vietnam, Turkey
  const popularCodes = ["JP", "KR", "CN", "TH", "US", "SG", "VN", "TR"];

  const featuredPackages = allProducts
    .filter(p => !p.isRegional && popularCodes.some(code => p.countries.includes(code)))
    // Basic sorting to show attractive packages first
    .sort((a, b) => a.price - b.price)
    // Take first 6 for featured section
    .slice(0, 6);

  // If API returns nothing, HomeClient handles empty state or shows nothing
  return <HomeClient featuredPackages={featuredPackages} />;
}
