
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
            typicalCost: '$150 - $180 (520,000 - 620,000 MNT) per way',
            duration: '~31 hours',
            scheduleHighlights: [
                'International train K24 departs UB on Thursdays at 07:18 (Resumes June 2025)',
                'Daily local train 275/276 to Zamiin-Uud (Budget alternative)',
                'Daily buses from Erlian to Beijing (Price ~240 CNY)'
            ],
            tips: [
                'Zamiin-Uud border is open 08:00 - 18:00',
                'Train K24 is very popular; book 2 months in advance via UBTZ app'
            ]
        },
        {
            destination: 'Erlian',
            transportMode: 'bus',
            typicalCost: '$30 - $50 (100,000 - 170,000 MNT) round trip',
            duration: '~12-15 hours',
            scheduleHighlights: [
                'Daily buses from Dragon Center to Zamiin-Uud',
                'Local train 649 departures daily at 20:50'
            ],
            tips: [
                'Erlian is a border shopping city - perfect for procurement',
                'Hotels in Erlian range from $20-40 (150-300 CNY)'
            ]
        },
        {
            destination: 'China',
            transportMode: 'flight',
            typicalCost: '$400 - $700 (1,380,000 - 2,400,000 MNT) round trip',
            duration: '~2.5 hours (Beijing)',
            scheduleHighlights: [
                'Air China and MIAT operate daily direct flights to Beijing (PEK/PKX)'
            ],
            tips: [
                'Direct flights are faster but usually 3-4x the cost of the train'
            ]
        }
    ],
    'KR': [
        {
            destination: 'Seoul',
            transportMode: 'flight',
            typicalCost: '$390 - $710 (1,350,000 - 2,450,000 MNT) round trip',
            duration: '~3.5 hours',
            scheduleHighlights: [
                'Daily flights by MIAT, Korean Air, Asiana, and Jeju Air',
                'MIAT has the most frequent service'
            ],
            tips: [
                'April is often the cheapest month to fly to Seoul',
                'August is peak season with highest prices'
            ]
        }
    ],
    'JP': [
        {
            destination: 'Tokyo',
            transportMode: 'flight',
            typicalCost: '$450 - $800 (1,550,000 - 2,750,000 MNT) round trip',
            duration: '~5.5 hours',
            scheduleHighlights: [
                'Direct flights to Narita (NRT) by MIAT and Aero Mongolia'
            ],
            tips: [
                'Connecting via Seoul or Beijing can save $100-200 if direct flights are full'
            ]
        }
    ],
    'TH': [
        {
            destination: 'Bangkok',
            transportMode: 'flight',
            typicalCost: '$550 - $900 (1,900,000 - 3,100,000 MNT) round trip',
            duration: '~6.5 hours (Direct)',
            scheduleHighlights: [
                'MIAT operates seasonal direct flights (mostly Winter)',
                'Connecting via Hong Kong or Seoul is available year-round'
            ],
            tips: [
                'March and May are generally the cheapest months for Bangkok'
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
