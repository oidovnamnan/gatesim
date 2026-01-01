"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-[#0d111c] w-full overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto relative h-full">
                {/* Top decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="p-8 pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
}
