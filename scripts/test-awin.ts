import path from 'path';
import fs from 'fs';

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
            }
        });
    }
}

loadEnv();

const PUBLISHER_ID = process.env.AWIN_PUBLISHER_ID;
const API_TOKEN = process.env.AWIN_API_TOKEN;

async function findMID() {
    if (!PUBLISHER_ID || !API_TOKEN) {
        console.error("Missing AWIN_PUBLISHER_ID or AWIN_API_TOKEN in .env.local");
        return;
    }

    const TARGET_MID = 18117;
    console.log(`Searching for MID ${TARGET_MID} in all relationships...`);

    const relationships = ['joined', 'notJoined', 'pending', 'rejected', 'suspended'];

    for (const rel of relationships) {
        try {
            const response = await fetch(
                `https://api.awin.com/publishers/${PUBLISHER_ID}/programmes?relationship=${rel}`,
                {
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`
                    }
                }
            );

            if (!response.ok) continue;

            const data: any = await response.json();
            if (Array.isArray(data)) {
                const found = data.find(p => p.id === TARGET_MID);
                if (found) {
                    console.log(`✅ Found in [${rel}]: [${found.id}] ${found.name}`);
                    return;
                }
            }
        } catch (e) { }
    }

    console.log(`❌ MID ${TARGET_MID} not found in any common relationship category.`);
}

findMID();
