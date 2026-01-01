"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] touch-manipulation select-none",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
                secondary:
                    "bg-white/10 text-white border border-white/10 hover:bg-white/20",
                ghost:
                    "text-white/70 hover:text-white hover:bg-white/10",
                outline:
                    "border border-white/20 text-white hover:bg-white/10",
                danger:
                    "bg-red-500 text-white shadow-lg shadow-red-500/25",
                success:
                    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
            },
            size: {
                default: "h-12 px-6 py-3",
                sm: "h-10 px-4 py-2 text-sm",
                lg: "h-14 px-8 py-4 text-base",
                xl: "h-16 px-10 py-5 text-lg",
                icon: "h-12 w-12",
                "icon-sm": "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, loading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {!loading && children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };
