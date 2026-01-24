
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetch dynamic AI configuration from Firestore with Env fallback
 */
export async function getOpenAIConfig() {
    try {
        // Try DB first
        const docRef = doc(db, "system", "config");
        const docSnap = await getDoc(docRef);

        let dbKey = "";
        if (docSnap.exists()) {
            dbKey = docSnap.data()?.openaiApiKey || "";
        }

        const envKey = process.env.OPENAI_API_KEY || "";

        // Priority: DB Key > Env Key
        const activeKey = dbKey || envKey;

        if (!activeKey) {
            console.warn("⚠️ No OpenAI API Key found in either Database or Environment Variables");
        }

        return {
            apiKey: activeKey,
            isFromDb: !!dbKey,
            model: "gpt-4o-mini" // Default model, can be made dynamic later
        };
    } catch (error) {
        console.error("❌ Failed to fetch AI config from DB, falling back to Env:", error);
        return {
            apiKey: process.env.OPENAI_API_KEY || "",
            isFromDb: false,
            model: "gpt-4o-mini"
        };
    }
}
