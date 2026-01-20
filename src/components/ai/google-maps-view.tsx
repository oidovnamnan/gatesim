"use client";

import { useMemo, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface Activity {
    day: number;
    title: string;
    location: string;
    coordinates?: { lat: number; lng: number };
}

interface GoogleMapsViewProps {
    activities: Activity[];
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
        },
    ],
};

export default function GoogleMapsView({ activities }: GoogleMapsViewProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<Activity | null>(null);

    const validActivities = useMemo(() =>
        activities.filter(a => a.coordinates && a.coordinates.lat && a.coordinates.lng),
        [activities]
    );

    const center = useMemo(() => {
        if (validActivities.length > 0) {
            return validActivities[0].coordinates;
        }
        return { lat: 0, lng: 0 };
    }, [validActivities]);

    const onLoad = useCallback((map: google.maps.Map) => {
        if (validActivities.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            validActivities.forEach(act => {
                if (act.coordinates) {
                    bounds.extend(act.coordinates);
                }
            });
            map.fitBounds(bounds);
        }
        setMap(map);
    }, [validActivities]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const path = useMemo(() =>
        validActivities.map(a => a.coordinates!),
        [validActivities]
    );

    if (!isLoaded) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (validActivities.length === 0) return null;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >
            {/* Route Line */}
            <Polyline
                path={path}
                options={{
                    strokeColor: "#10b981",
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                }}
            />

            {/* Markers */}
            {validActivities.map((act, idx) => (
                <Marker
                    key={idx}
                    position={act.coordinates!}
                    label={{
                        text: `${act.day}`,
                        color: "white",
                        fontWeight: "bold"
                    }}
                    onClick={() => setSelectedMarker(act)}
                />
            ))}

            {/* Info Window */}
            {selectedMarker && selectedMarker.coordinates && (
                <InfoWindow
                    position={selectedMarker.coordinates}
                    onCloseClick={() => setSelectedMarker(null)}
                >
                    <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-slate-800 text-sm mb-1">
                            Day {selectedMarker.day}: {selectedMarker.title}
                        </h3>
                        <p className="text-xs text-slate-500">{selectedMarker.location}</p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
