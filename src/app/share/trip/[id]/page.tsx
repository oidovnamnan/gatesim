import { Suspense } from "react";
import { Metadata } from "next";
import { TripShareView } from "@/components/ai/share/trip-share-view";
import { MapPin, Loader2 } from "lucide-react";

async function getTrip(id: string) {
    // For server-side fetching, we can call the service directly or the API
    // Since we're in Next.js, calling the direct service is faster but let's use the absolute URL for simplicity or DB directly
    // Let's use the API with absolute path if possible or DB directly.
    // However, to keep it simple and robust, let's fetch via internal API (requires BASE_URL)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/api/trips/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.trip;
    } catch (e) {
        console.error("Fetch error", e);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const trip = await getTrip(params.id);
    if (!trip) return { title: "Trip Not Found | GateSIM" };

    return {
        title: `${trip.destination} - ${trip.duration} Day Plan | GateSIM AI`,
        description: `Explore this personalized travel itinerary for ${trip.destination} created with GateSIM AI Travel Planner.`,
        openGraph: {
            title: `${trip.destination} Travel Plan`,
            description: `Check out my ${trip.duration}-day trip to ${trip.destination}!`,
            type: "website",
        }
    };
}

export default async function SharePage({ params, searchParams }: { params: { id: string }, searchParams: { lang?: string } }) {
    const trip = await getTrip(params.id);
    const isMongolian = searchParams.lang === 'mn' || true; // Default to true for local users or detect from trip

    if (!trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {isMongolian ? "Төлөвлөгөө олдсонгүй" : "Trip Not Found"}
                </h1>
                <p className="text-slate-500 max-w-xs">
                    {isMongolian ? "Уучлаарай, таны хайсан аяллын төлөвлөгөө байхгүй эсвэл устгагдсан байна." : "Sorry, the trip you're looking for doesn't exist or has been deleted."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            }>
                <TripShareView trip={trip} isMongolian={isMongolian} />
            </Suspense>
        </div>
    );
}
