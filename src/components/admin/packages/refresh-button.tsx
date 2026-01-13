"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncPackages } from "@/app/actions/packages";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function RefreshButton() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await syncPackages();
            if (res.success) {
                toast({
                    title: "Synced Successfully",
                    description: "Package list has been updated from MobiMatter.",
                    variant: "success"
                });
                router.refresh(); // Refresh current route to fetch new data
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast({
                title: "Sync Failed",
                description: "Failed to update packages. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="secondary" className="h-10 gap-2" onClick={handleSync} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Syncing..." : "Sync from MobiMatter"}
        </Button>
    );
}
