"use client";

import AITravelPlannerV2 from "@/components/ai/ai-travel-planner-v2";
import { motion } from "framer-motion";

export default function PlannerPage() {
    return (
        <div className="min-h-screen bg-white">
            <AITravelPlannerV2 />
        </div>
    );
}
