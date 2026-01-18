"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AITransitPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/ai?mode=transit");
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Opening Transit Guide...</p>
        </div>
    );
}
