
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTranslation } from "@/providers/language-provider";
import { motion } from "framer-motion";
import { Loader2, MapPin, Calendar, Wallet, ArrowRight, Share2, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface Trip {
    id: string;
    destination: string;
    duration: number;
    purpose: string;
    budget: string;
    itinerary: any;
    createdAt: any;
}

export function MyTripsTab() {
    const { user } = useAuth();
    const { t, language } = useTranslation(); // Assuming language is available
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user) return;

        const fetchTrips = async () => {
            try {
                const res = await fetch(`/api/trips/list?userId=${user.uid}`);
                const data = await res.json();
                if (data.trips) {
                    setTrips(data.trips);
                }
            } catch (error) {
                console.error("Failed to fetch trips", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [user]);

    const handleViewTrip = (trip: Trip) => {
        // In a real app we would have a dynamic route /itinerary/[id]
        // serve the saved itinerary. For now, we might just show details or alert
        // Since we don't have a /itineraries/[id] page yet, we will just show a modal or simple view?
        // Actually, the prompt implies "User Profile Enhancement".
        // Let's at least show the JSON or a summary.
        // OR better, we can load it back into the planner? (Complex)
        // Let's assume for now we just display the summary cards.
        alert("Trip details view coming soon!");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Globe className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {language === 'mn' ? "Аялал олдсонгүй" : "No Trips Found"}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                    {language === 'mn'
                        ? "Та хараахан аялал төлөвлөөгүй байна."
                        : "You haven't planned any trips yet."}
                </p>
                <Button
                    onClick={() => router.push('/ai-travel-planner')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                    {language === 'mn' ? "Аялал төлөвлөх" : "Plan a Trip"}
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
                <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                >
                    <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl h-full flex flex-col">
                        <div className="h-32 bg-slate-100 relative overflow-hidden">
                            {/* Placeholder generic image since we don't save cover image yet */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-90" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="font-bold text-xl">{trip.destination}</h3>
                                <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{trip.duration} {language === 'mn' ? "өдөр" : "days"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100">
                                    {trip.purpose}
                                </Badge>
                                <Badge variant="outline" className="text-slate-500 border-slate-200">
                                    {trip.budget}
                                </Badge>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                                <span className="text-xs text-slate-400 font-medium">
                                    {new Date(trip.createdAt?.seconds * 1000).toLocaleDateString()}
                                </span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 -mr-2"
                                    onClick={() => handleViewTrip(trip)}
                                >
                                    {language === 'mn' ? "Дэлгэрэнгүй" : "View Details"}
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

// Fallback if language context isn't set up efficiently yet
function useLanguageSafe() {
    try {
        return useTranslation();
    } catch (e) {
        return { t: (s: string) => s, language: 'en' };
    }
}
