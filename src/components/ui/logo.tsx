import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
        >
            {/* 
        LOGOMARK: THE NEXUS
        Concept: Central Hub (G) + Global Network + Connectivity
      */}

            {/* 1. GLOBE WIREFRAME (The World) - Adaptive Color */}
            {/* Outer rings/orbits acting as the globe structure */}
            <g className="stroke-slate-900 dark:stroke-white transition-colors duration-300" strokeWidth="2">
                <circle cx="50" cy="50" r="45" opacity="0.5" />
                <ellipse cx="50" cy="50" rx="45" ry="18" transform="rotate(45 50 50)" />
                <ellipse cx="50" cy="50" rx="45" ry="18" transform="rotate(-45 50 50)" />
            </g>

            {/* 2. CONNECTIVITY SPOKES (The Red Network) */}
            <g className="stroke-red-600" strokeWidth="3" strokeLinecap="round">
                {/* 8 Radial lines connecting Core to World */}
                <line x1="50" y1="32" x2="50" y2="10" /> {/* Top */}
                <line x1="50" y1="68" x2="50" y2="90" /> {/* Bottom */}
                <line x1="32" y1="50" x2="10" y2="50" /> {/* Left */}
                <line x1="68" y1="50" x2="90" y2="50" /> {/* Right */}

                {/* Diagonals */}
                <line x1="37" y1="37" x2="22" y2="22" />
                <line x1="63" y1="37" x2="78" y2="22" />
                <line x1="37" y1="63" x2="22" y2="78" />
                <line x1="63" y1="63" x2="78" y2="78" />
            </g>

            {/* 3. CONNECTION NODES (Dots) */}
            <g className="fill-red-600">
                {/* 8 Outer Dots */}
                <circle cx="50" cy="5" r="3" />
                <circle cx="50" cy="95" r="3" />
                <circle cx="5" cy="50" r="3" />
                <circle cx="95" cy="50" r="3" />

                <circle cx="18" cy="18" r="3" />
                <circle cx="82" cy="18" r="3" />
                <circle cx="18" cy="82" r="3" />
                <circle cx="82" cy="82" r="3" />
            </g>

            {/* 4. CENTRAL CORE (The Hub) */}
            <circle
                cx="50"
                cy="50"
                r="18"
                className="fill-slate-900 dark:fill-white transition-colors duration-300"
            />

            {/* 5. THE LETTER 'G' */}
            <text
                x="50"
                y="50"
                dy=".35em"
                textAnchor="middle"
                fontSize="24"
                fontFamily="Arial, sans-serif"
                fontWeight="900"
                className="fill-white dark:fill-slate-900 transition-colors duration-300 pointer-events-none"
            >
                G
            </text>
        </svg>
    );
};
