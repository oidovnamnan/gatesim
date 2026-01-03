const https = require('https');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const API_KEY = process.env.MOBIMATTER_API_KEY;
const MERCHANT_ID = process.env.MOBIMATTER_MERCHANT_ID;

console.log('--- Checking API Configuration ---');
console.log('Key:', API_KEY ? 'Present' : 'Missing');
console.log('MerchID:', MERCHANT_ID ? 'Present' : 'Missing');

if (!API_KEY || !MERCHANT_ID) {
    console.error('ERROR: Missing keys.');
    process.exit(1);
}

const options = {
    hostname: 'api.mobimatter.com',
    path: '/mobimatter/api/v2/products',
    method: 'GET',
    headers: {
        'api-key': API_KEY,
        'merchantId': MERCHANT_ID,
        'Accept': 'application/json'
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let rawData = '';
    res.on('data', (chunk) => {
        rawData += chunk;
        // Print first 500 chars to debug
        if (rawData.length < 500) {
            console.log('Chunk received:', chunk.toString().substring(0, 100));
        }
    });

    res.on('end', () => {
        console.log('Response ended. Total length:', rawData.length);
        if (rawData.length > 0) {
            try {
                const json = JSON.parse(rawData);
                console.log('JSON Parsed Successfully.');
                const list = Array.isArray(json) ? json : (json.result || []);
                console.log(`Product Count: ${list.length}`);
                if (list.length > 0) console.log('First Item SKU:', list[0].productId);
            } catch (e) {
                console.error('JSON Parse Error:', e.message);
                console.log('Raw start:', rawData.substring(0, 200));
            }
        } else {
            console.error('Empty response body.');
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.end();
