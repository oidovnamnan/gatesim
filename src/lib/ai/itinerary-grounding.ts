
export interface RouteGrounding {
    destination: string;
    transportMode: 'flight' | 'train' | 'bus' | 'car';
    typicalCost: string;
    duration: string;
    scheduleHighlights: string[];
    tips: string[];
}

// Static registry of common routes from Mongolia
const LOCAL_ROUTE_REGISTRY: Record<string, RouteGrounding[]> = {
    'CN': [
        {
            destination: 'Beijing',
            transportMode: 'train',
            typicalCost: '$100 - $150 (350,000 - 520,000 MNT) round trip',
            duration: '~30 hours (including border)',
            scheduleHighlights: [
                'International train departs UB on Thursday/Sunday (seasonal)',
                'Local train to Zamiin-Uud departs daily',
                'Bus from Erlian to Beijing departs daily'
            ],
            tips: [
                'Zamiin-Uud border is open 08:00 - 18:00',
                'Border crossing can take 2-5 hours by bus/car'
            ]
        },
        {
            destination: 'Erlian',
            transportMode: 'bus',
            typicalCost: '$30 - $50 (100,000 - 170,000 MNT) round trip',
            duration: '~12-15 hours',
            scheduleHighlights: [
                'Daily buses from Dragon Center to Zamiin-Uud',
                '649 train to Zamiin-Uud departs daily at 20:50'
            ],
            tips: [
                'Erlian is a border shopping city',
                'Hotels in Erlian are roughly $20-40 per night'
            ]
        },
        {
            destination: 'China',
            transportMode: 'flight',
            typicalCost: '$400 - $700 (1,400,000 - 2,400,000 MNT) round trip',
            duration: '~2.5 hours (Beijing)',
            scheduleHighlights: [
                'Air China and MIAT operate daily flights'
            ],
            tips: [
                'Arrive at UBN airport 3 hours early'
            ]
        }
    ],
    'KR': [
        {
            destination: 'Seoul',
            transportMode: 'flight',
            typicalCost: '$350 - $600 (1,200,000 - 2,100,000 MNT) round trip',
            duration: '~3.5 hours',
            scheduleHighlights: [
                'Multiple daily flights by MIAT, Korean Air, Asiana, Jeju Air'
            ],
            tips: [
                'Incheon airport (ICN) is roughly 1 hour from central Seoul',
                'AREX train is the fastest way to Seoul Station'
            ]
        }
    ],
    'JP': [
        {
            destination: 'Tokyo',
            transportMode: 'flight',
            typicalCost: '$500 - $900 (1,700,000 - 3,100,000 MNT) round trip',
            duration: '~5.5 hours',
            scheduleHighlights: [
                'Direct flights by MIAT (Narita), Aero Mongolia (Narita)'
            ],
            tips: [
                'Direct flights are limited to specific days',
                'Connecting via Seoul/Beijing can be cheaper'
            ]
        }
    ],
    'TH': [
        {
            destination: 'Bangkok',
            transportMode: 'flight',
            typicalCost: '$600 - $1000 (2,100,000 - 3,500,000 MNT) round trip',
            duration: '~6.5 hours (Direct)',
            scheduleHighlights: [
                'Direct flights by MIAT (seasonal) or connecting via Seoul/Hong Kong'
            ],
            tips: [
                'Direct flights are mostly in winter season'
            ]
        }
    ]
};

export function getGroundingContext(destination: string, transportMode: string, city?: string): string {
    const countryRoutes = LOCAL_ROUTE_REGISTRY[destination] || [];

    // Try to find a specific city match first
    let route = city ? countryRoutes.find(r => r.destination.toLowerCase() === city.toLowerCase() && r.transportMode === transportMode) : null;

    // If no city match, try to find a transport mode match
    if (!route) {
        route = countryRoutes.find(r => r.transportMode === transportMode);
    }

    // If still no match, try any route for the country
    if (!route && countryRoutes.length > 0) {
        route = countryRoutes[0];
    }

    if (!route) return "";

    return `
--- LIVE TRANSPORT DATA (Ground Truth) ---
Use these REAL-WORLD parameters for your generation:
- Mode: ${route.transportMode.toUpperCase()} to ${route.destination}
- Typical Round-trip Cost: ${route.typicalCost}
- Duration: ${route.duration}
- Schedule Highlights: ${route.scheduleHighlights.join(', ')}
- Local Tips: ${route.tips.join(', ')}
--- END LIVE DATA ---
`;
}
