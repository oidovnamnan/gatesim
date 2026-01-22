import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import OpenAI from "openai";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { idea } = await req.json();

        if (!idea) {
            return NextResponse.json({ error: "Idea is required" }, { status: 400 });
        }

        // Get API key
        let openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            const configRef = doc(db, "system", "config");
            const configSnap = await getDoc(configRef);
            openaiApiKey = configSnap.data()?.openaiApiKey;
        }

        if (!openaiApiKey) {
            return NextResponse.json({ error: "OpenAI API Key not configured" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiApiKey });

        const systemPrompt = `You are an expert AI Prompt Engineer for GateSIM, a global travel eSIM provider. 
Your goal is to take a simple user idea and transform it into a highly detailed, professional DALL-E 3 prompt that GUARANTEES branding consistency.

MANDATORY BRANDING REQUIREMENTS:
1. The image MUST feature a smartphone or digital element representing connectivity.
2. The text "GateSIM" MUST be included in the image, naturally integrated (e.g., on a phone screen, a holographic overlay, or a modern 3D element in the background).
3. The aesthetic should be Premium, Modern, and Travel-focused.

OUTPUT FORMAT:
Return ONLY the enhanced prompt text. Do not include explanations.

Example Input: "Woman on beach"
Example Output: "Cinematic shot of a relaxed female traveler sitting on a white sand beach in Bali. She is holding a modern smartphone displaying the 'GateSIM' logo with a strong signal icon. Golden hour lighting, turquoise water background. 8k resolution, commercial photography style, highly detailed."
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Enhance this idea for a marketing poster: "${idea}"` }
            ],
            temperature: 0.7,
        });

        const enhancedPrompt = response.choices[0]?.message?.content || "";

        return NextResponse.json({ prompt: enhancedPrompt });

    } catch (error: any) {
        console.error("Prompt enhancement error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
