const Amadeus = require('amadeus');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the app directory
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function runAudit() {
    console.log("--- AMADEUS API AUDIT START ---");

    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("❌ ERROR: Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET in .env.local");
        return;
    }

    console.log(`Using Client ID: ${clientId.substring(0, 5)}...`);

    const amadeus = new Amadeus({
        clientId,
        clientSecret
    });

    // 1. Test Flight Search (ULN -> ICN)
    console.log("\n1. Testing Flight Search (ULN -> ICN)...");
    try {
        const flights = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: 'ULN',
            destinationLocationCode: 'ICN',
            departureDate: '2026-05-20',
            adults: '1'
        });
        console.log(`✅ SUCCESS: Found ${flights.data.length} flights.`);
        if (flights.data.length > 0) {
            console.log(`   Sample: ${flights.data[0].price.total} ${flights.data[0].price.currency}`);
        }
    } catch (e) {
        console.error("❌ Flight Search FAILED:", e.code || e.message);
    }

    // 2. Test City Detail Search (London)
    console.log("\n2. Testing City Detail Search (London)...");
    let geo = null;
    try {
        const cities = await amadeus.referenceData.locations.get({
            keyword: 'London',
            subType: Amadeus.location.city
        });
        if (cities.data.length > 0) {
            geo = cities.data[0].geoCode;
            console.log(`✅ SUCCESS: Found city London. Lat: ${geo.latitude}, Lng: ${geo.longitude}`);
        }
    } catch (e) {
        console.error("❌ City Search FAILED:", e.code || e.message);
    }

    // 3. Test Activity Search (using London geo)
    if (geo) {
        console.log("\n3. Testing Activity Search (London)...");
        try {
            const activities = await amadeus.shopping.activities.get({
                latitude: geo.latitude,
                longitude: geo.longitude,
                radius: 1
            });
            console.log(`✅ SUCCESS: Found ${activities.data.length} activities.`);
            if (activities.data.length > 0) {
                console.log("--- SAMPLE ACTIVITY DATA ---");
                console.log(JSON.stringify(activities.data[0], null, 2));
                console.log("----------------------------");
            }
        } catch (e) {
            console.error("❌ Activity Search FAILED:", e.code || e.message);
        }
    }

    // 4. Test Hotel Search (LON)
    console.log("\n4. Testing Hotel Search (LON)...");
    try {
        const hotels = await amadeus.referenceData.locations.hotels.byCity.get({
            cityCode: 'LON'
        });
        console.log(`✅ SUCCESS: Found ${hotels.data.length} hotels.`);
        if (hotels.data.length > 0) {
            console.log("--- SAMPLE HOTEL DATA ---");
            console.log(JSON.stringify(hotels.data[0], null, 2));
            console.log("--------------------------");
        }
    } catch (e) {
        console.error("❌ Hotel Search FAILED:", e.code || e.message);
    }

    console.log("\n--- AMADEUS API AUDIT END ---");
}

runAudit();
