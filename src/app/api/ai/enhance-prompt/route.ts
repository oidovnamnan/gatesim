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

        const { idea, includeBranding, brandDescription, targetModel, isRandom } = await req.json();

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

        const shouldBrand = includeBranding !== false;

        const systemPrompt = `You are a World-Class AI Prompt Engineer for Image Generation, specializing in high-end commercial travel photography and technology marketing.
Your task is to take a simple concept (or invent one if isRandom is true) and expand it into a MASTERPIECE PROMPT.

TARGET MODEL: ${targetModel === 'google' ? 'Google Imagen 4/3' : 'DALL-E 3'}

${targetModel === 'google'
                ? "Prompting Style for Imagen: Use a structured 'Subject-Action-Context-Lighting-Camera' approach. Focus on photo-realism and precise placement."
                : "Prompting Style for DALL-E 3: Use natural language, descriptive sentences. Avoid list-style keywords. Describe the scene as a story."}

AESTHETIC GUIDELINES (TRAVEL & NETWORK):
1. LIGHTING: Use terms like "Golden hour", "Cinematic ambient glow", "Soft HDR", or "Natural sunlight streaming".
2. COMPOSITION: Focus on "Rule of thirds", "Wide-angle lens (24mm)", "Depth of field", "Soft bokeh background".
3. TECH AESTHETIC: Integrate connectivity elements naturally: "Global network nodes", "Digital pathways", "Interconnected data streams", "Vibrant blue and magenta light trails".
4. FORBIDDEN WORDS: Do NOT use "4K", "Hyperrealistic", "Masterpiece", or "HD". Instead, use "Professional editorial travel photograph", "Shot on 35mm film", or "Authentic textures".

BRANDING & CONNECTIVITY:
${shouldBrand
                ? `Represent 'connectivity' naturally and artistically. The word 'GateSIM' should be integrated professionally only if it fits the scene (e.g., on a digital display, branded travel gear, or subtle holographic UI). DO NOT force a smartphone unless it is a natural part of the traveler's activity. Focus on the vibe of 'seamless global connection'.`
                : "No text or logos."}

RANDOMIZATION:
If isRandom is true, generate a unique, non-repeating scenario involving travel and connectivity in a famous or beautiful global location.

OUTPUT FORMAT:
Return ONLY the raw enhanced prompt text. No "Here is the prompt" prefix.`

        const userContent = isRandom
            ? "Generate a random, stunning, non-repeating travel and network connectivity scenario and enhance it."
            : `Enhance this idea for a marketing poster: "${idea}"`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            temperature: 0.8, // Slightly higher for more variety
        });

        const enhancedPrompt = response.choices[0]?.message?.content || "";

        return NextResponse.json({ prompt: enhancedPrompt });

    } catch (error: any) {
        console.error("Prompt enhancement error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
