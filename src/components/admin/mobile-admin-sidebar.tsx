"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileAdminSidebar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar when route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="md:hidden text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
                <Menu className="h-6 w-6" />
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-[#0d111c] border-slate-800" onClose={() => setOpen(false)}>
                    <AdminSidebar className="w-full border-none bg-transparent" />
                </SheetContent>
            </Sheet>
        </>
    );
}
