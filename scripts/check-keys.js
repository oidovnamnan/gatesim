
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const dotenv = require('dotenv');
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function checkConfig() {
    try {
        console.log("Initializing Firebase...");
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log("Fetching system/config...");
        const docRef = doc(db, "system", "config");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("--- Firestore Configuration Found ---");
            console.log("OpenAI API Key (DB):", data.openaiApiKey ? (data.openaiApiKey.substring(0, 12) + "...") : "NOT SET");
            console.log("Env OpenAI Key:", process.env.OPENAI_API_KEY ? (process.env.OPENAI_API_KEY.substring(0, 12) + "...") : "NOT SET");

            if (data.openaiApiKey && data.openaiApiKey !== process.env.OPENAI_API_KEY) {
                console.log("\n✅ CONFIRMED: The key in Database is DIFFERENT from .env");
                console.log("The system is currently using the OLD key from .env");
            } else if (data.openaiApiKey === process.env.OPENAI_API_KEY) {
                console.log("\n⚠️ WARNING: Keys are the same, but both might be invalid.");
            }
        } else {
            console.log("❌ No config found in Firestore!");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

checkConfig();
