"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Dynamically import Google Maps to avoid SSR issues
const GoogleMapsView = dynamic(() => import("./google-maps-view"), { ssr: false });

// Fix Leaflet default icon issue
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Activity {
    day: number;
    title: string;
    location: string;
    coordinates?: { lat: number; lng: number };
}

interface ItineraryMapProps {
    activities: Activity[];
}

function MapUpdater({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

export default function ItineraryMap({ activities }: ItineraryMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    // Determine if we should use Google Maps (if Key exists)
    const useGoogleMaps = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const validActivities = activities.filter(
        a => a.coordinates && a.coordinates.lat && a.coordinates.lng
    );

    if (!isMounted || validActivities.length === 0) {
        return null;
    }

    if (useGoogleMaps) {
        return (
            <Card className="h-[400px] w-full overflow-hidden border-slate-200 z-0">
                <GoogleMapsView activities={activities} />
            </Card>
        );
    }

    // Fallback: Leaflet with CartoDB Voyager style
    const points = validActivities.map(a => [a.coordinates!.lat, a.coordinates!.lng] as [number, number]);
    const bounds = L.latLngBounds(points);

    return (
        <Card className="h-[400px] w-full overflow-hidden border-slate-200 z-0">
            <MapContainer
                center={points[0]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                {/* CartoDB Voyager - Premium Free Style */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {validActivities.map((act, idx) => (
                    <Marker
                        key={idx}
                        position={[act.coordinates!.lat, act.coordinates!.lng]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="font-bold text-sm">Day {act.day}: {act.title}</div>
                            <div className="text-xs text-slate-500">{act.location}</div>
                        </Popup>
                    </Marker>
                ))}

                <Polyline positions={points} color="#10b981" weight={4} opacity={0.7} />

                <MapUpdater bounds={bounds} />
            </MapContainer>
        </Card>
    );
}
