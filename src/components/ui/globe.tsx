"use client";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";

interface GlobeProps {
    className?: string;
    size?: number; // Explicit size control
}

export function Globe({ className, size = 600 }: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 4.5;

        if (!canvasRef.current) return;

        // Force strict square sizing based on prop
        // This avoids ANY browser layout calculation errors
        const width = size;
        const height = size;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: height * 2,
            phi: 0,
            theta: 0.2,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 20000,
            mapBrightness: 6,
            baseColor: [0.95, 0.95, 0.95],
            markerColor: [0.1, 0.4, 0.9],
            glowColor: [0.7, 0.8, 1],
            opacity: 0.8,
            markers: [],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.003;
                // Do not update width/height dynamically to prevent resizing glitches
            },
        });

        return () => {
            globe.destroy();
        };
    }, [size]); // Re-create if size changes

    return (
        <div className={className} style={{ width: size, height: size }}>
            <canvas
                ref={canvasRef}
                width={size * 2} // Physical pixel width
                height={size * 2} // Physical pixel height
                style={{ width: "100%", height: "100%", outline: "none" }}
            />
        </div>
    );
}
