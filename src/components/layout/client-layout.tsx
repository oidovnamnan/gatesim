"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopHeader } from "@/components/layout/top-header";
import { MaintenanceGuard } from "@/components/layout/maintenance-guard";
import { AIChat } from "@/components/ai/ai-chat";
import { InstallPrompt } from "@/components/pwa/install-prompt";

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) {
        // Admin layout - Clean, no Headers/Footers, no Maintenance Guard (Admins should access anyway)
        return <>{children}</>;
    }

    // Customer layout
    return (
        <MaintenanceGuard>
            {/* Desktop & Mobile Header */}
            <div className="relative z-50">
                <TopHeader />
            </div>
            <div className="app-container relative z-10 pb-24 md:pb-0">
                {children}
            </div>
            {/* Mobile Navigation */}
            <div className="md:hidden">
                <BottomNav />
            </div>

            {/* Global AI Chat */}
            <Suspense fallback={null}>
                <AIChat />
            </Suspense>

            {/* PWA Install Prompt */}
            <InstallPrompt />
        </MaintenanceGuard>
    );
}
