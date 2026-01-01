"use client";

import { motion } from "framer-motion";
import { LucideIcon, SearchX, PackageX, Inbox } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex flex-col items-center justify-center py-12 px-6 text-center",
                className
            )}
        >
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <Icon className="h-10 w-10 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-white/50 mb-6 max-w-xs">{description}</p>
            )}
            {action && (
                action.href ? (
                    <a href={action.href}>
                        <Button variant="secondary">{action.label}</Button>
                    </a>
                ) : (
                    <Button variant="secondary" onClick={action.onClick}>
                        {action.label}
                    </Button>
                )
            )}
        </motion.div>
    );
}

// Pre-configured empty states
export function SearchEmptyState({ onClear }: { onClear?: () => void }) {
    return (
        <EmptyState
            icon={SearchX}
            title="Илэрц олдсонгүй"
            description="Хайлтын нөхцлөө өөрчилж үзнэ үү"
            action={onClear ? { label: "Хайлт цэвэрлэх", onClick: onClear } : undefined}
        />
    );
}

export function NoPackagesEmptyState() {
    return (
        <EmptyState
            icon={PackageX}
            title="Багц олдсонгүй"
            description="Энэ улсад одоогоор багц байхгүй байна"
            action={{ label: "Бүх багцууд", href: "/packages" }}
        />
    );
}

export function NoOrdersEmptyState() {
    return (
        <EmptyState
            icon={Inbox}
            title="Захиалга байхгүй"
            description="Та одоогоор ямар ч багц худалдаж аваагүй байна"
            action={{ label: "Багц сонгох", href: "/packages" }}
        />
    );
}
