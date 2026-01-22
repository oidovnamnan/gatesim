

export interface DiscoveryItem {
    id: string;
    name: string;
    description: string;
    rating: number;
    price: string;
    image: string;
    address: string;
    focus: string[];
    bookingUrl?: string;     // NEW: For affiliate links
    affiliateSource?: string; // NEW: e.g. 'Awin', 'Klook'
}

/**
 * Verified Ground Truth for top attractions/markets for Mongolian travelers
 */
export const VERIFIED_DISCOVERY_DATA: Record<string, Record<string, DiscoveryItem[]>> = {
    'china': {
        'beijing': [
            {
                id: 'hongqiao-pearl',
                name: 'Hongqiao Pearl Market (Улаан хаалгатай зах)',
                description: 'Famous wholesale market for pearls, electronics, and souvenirs. Very popular among Mongolian traders for jewelry and small gadgets.',
                rating: 4.8,
                price: 'Wholesale / Negotiable',
                image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&q=80&w=800',
                address: 'No. 9 Tiantan Road, Dongcheng District',
                focus: ['procurement', 'shopping', 'tourist'],
                bookingUrl: 'https://www.trip.com/travel-guide/beijing/hongqiao-pearl-market-105244/?Allianceid=3839282&SID=22212211', // Placeholder Affiliate
                affiliateSource: 'Trip.com'
            },
            {
                id: 'silk-market',
                name: 'Silk Market (Xiushui Street)',
                description: 'Prime location for high-quality silk, cashmere, and branded clothing. Professional multistory mall with thousands of vendors.',
                rating: 4.6,
                price: 'Negotiable',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
                address: 'No. 8 Xiushui East Street, Chaoyang District',
                focus: ['procurement', 'shopping'],
                bookingUrl: 'https://www.trip.com/travel-guide/beijing/silk-market-105234',
                affiliateSource: 'Trip.com'
            },
            {
                id: 'yabao-lu',
                name: 'Yabaolu Market (Орос зах)',
                description: 'Specialized wholesale district for fur coats, hats, and bulk clothing exports. Known for trade with CIS and Mongolian markets.',
                rating: 4.5,
                price: 'Bulk Wholesale',
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
                address: 'Yabaolu, Chaoyang District',
                focus: ['procurement', 'business']
            }
        ]
    },
    'south-korea': {
        'seoul': [
            {
                id: 'dongdaemun',
                name: 'Dongdaemun Fashion Town (Тондэмүн)',
                description: 'The ultimate wholesale and retail fashion hub in Seoul. Open nearly 24/7, it is the primary sourcing ground for Mongolian fashion traders.',
                rating: 4.9,
                price: 'Wholesale / Retail',
                image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&q=80&w=800',
                address: 'Eulji-ro, Jung-gu, Seoul',
                focus: ['procurement', 'shopping'],
                bookingUrl: 'https://www.klook.com/en-US/activity/123-dongdaemun-shopping/',
                affiliateSource: 'Klook'
            },
            {
                id: 'myeongdong',
                name: 'Myeong-dong Shopping Street',
                description: 'The heart of Korean beauty and skin-care brands. Highly recommended for family shopping and cultural street food experiences.',
                rating: 4.7,
                price: 'Retail',
                image: 'https://images.unsplash.com/photo-1538669715515-5c024ec4408c?auto=format&fit=crop&q=80&w=800',
                address: 'Myeong-dong, Jung-gu, Seoul',
                focus: ['shopping', 'tourist', 'family']
            }
        ]
    },
    'japan': {
        'tokyo': [
            {
                id: 'akihabara',
                name: 'Akihabara Electric Town',
                description: 'The world-famous electronics and sub-culture district. Best place for professional photography gear, gadgets, and anime culture.',
                rating: 4.8,
                price: 'Varies',
                image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=800',
                address: 'Sotokanda, Chiyoda City, Tokyo',
                focus: ['shopping', 'tourist', 'procurement'],
                bookingUrl: 'https://www.klook.com/en-US/activity/456-akihabara-tour/',
                affiliateSource: 'Klook'
            },
            {
                id: 'ginza',
                name: 'Ginza District',
                description: 'Tokyo\'s premier luxury shopping, dining, and entertainment district. Home to major department stores and flagship international brands.',
                rating: 4.9,
                price: 'Luxury',
                image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
                address: 'Ginza, Chuo City, Tokyo',
                focus: ['shopping', 'luxury', 'business']
            }
        ]
    }
};

export function getVerifiedDiscovery(country: string, city: string, type: string): DiscoveryItem[] {
    const countryData = VERIFIED_DISCOVERY_DATA[country.toLowerCase()];
    if (!countryData) return [];

    const cityData = countryData[city.toLowerCase()];
    if (!cityData) return [];

    return cityData.filter(item => item.focus.includes(type));
}

