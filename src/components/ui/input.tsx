"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Search, X } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    onClear?: () => void;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon: Icon, onClear, error, ...props }, ref) => {
        const [showClear, setShowClear] = React.useState(false);

        return (
            <div className="relative w-full">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        Icon && "pl-12",
                        onClear && "pr-12",
                        error && "border-red-500/50 focus:ring-red-500/50",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setShowClear(true)}
                    onBlur={() => setTimeout(() => setShowClear(false), 200)}
                    {...props}
                />
                {onClear && showClear && props.value && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                {error && (
                    <p className="mt-1.5 text-sm text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

// Search Input specialized component
interface SearchInputProps extends Omit<InputProps, 'icon'> {
    onSearch?: (value: string) => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, onSearch, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            onSearch?.(e.target.value);
        };

        return (
            <Input
                ref={ref}
                type="search"
                icon={Search}
                onChange={handleChange}
                className={cn("", className)}
                {...props}
            />
        );
    }
);

SearchInput.displayName = "SearchInput";

export { Input, SearchInput };
