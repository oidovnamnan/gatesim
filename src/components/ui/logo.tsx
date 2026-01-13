import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("relative aspect-square", className)}>
            <Image
                src="/icon-192.png"
                alt="GateSIM Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
};
