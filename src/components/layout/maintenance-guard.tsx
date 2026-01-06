"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { subscribeToSystemConfig } from "@/lib/db";
import { Loader2, Hammer } from "lucide-react";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToSystemConfig((config) => {
            setMaintenanceMode(config.maintenanceMode || false);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Allow admin routes and api routes to bypass maintenance
    const isBypassRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/api");

    if (loading) {
        return <>{children}</>; // Render children while loading to prevent flash? Or loading spinner?
        // Better to just show children to avoid blocking Initial Paint.
        // Maintenance mode is an "interruption", so it's okay if it pops in.
    }

    if (maintenanceMode && !isBypassRoute) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white p-4">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto">
                        <Hammer className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2">System Maintenance</h1>
                        <p className="text-white/60">
                            We are currently performing scheduled maintenance to improve our services.
                            Please check back shortly.
                        </p>
                    </div>
                    <div className="text-xs text-white/30 pt-4 border-t border-white/5">
                        GateSIM Team
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
