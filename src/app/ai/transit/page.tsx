"use client";

import { AITransitAgent } from "@/components/ai/ai-transit-agent";

export default function AITransitPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 pt-6">
                <AITransitAgent />
            </div>
        </div>
    );
}
