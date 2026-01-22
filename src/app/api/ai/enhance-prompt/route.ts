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

        const { idea, includeBranding, brandDescription } = await req.json();

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

        const shouldBrand = includeBranding !== false; // Default to true if undefined

        let detailedBranding = `
1. The image MUST feature a smartphone or digital element representing connectivity.
2. The text "GateSIM" MUST be included in the image, naturally integrated (e.g., on a phone screen, a holographic overlay, or a modern 3D element in the background).
3. The aesthetic should be Premium, Modern, and Travel-focused.`;

        if (shouldBrand && brandDescription) {
            detailedBranding = `
1. The image MUST feature a smartphone or digital element representing connectivity.
2. BRAND IDENTITY & LOGO EXECUTION (Critical): 
   ${brandDescription}
   ENSURE the logo is rendered exactly as described above.
3. The text "GateSIM" MUST be included.
4. The aesthetic should be Premium, Modern, and Travel-focused.`;
        }

        const brandingInstructions = shouldBrand
            ? `MANDATORY BRANDING REQUIREMENTS:
${detailedBranding}`
            : `AESTHETIC GUIDELINES:
1. Focus purely on high-quality, professional photography or artistic rendering.
2. Do NOT include any forced text or logos.
3. The aesthetic should be Premium and Cinematic.`;

        const systemPrompt = `You are a World-Class AI Prompt Engineer for DALL-E 3, specializing in commercial advertising.
Your task is to take a simple concept and expand it into a MASTERPIECE PROMPT (100-200 words).

${brandingInstructions}

REQUIREMENTS FOR "MASTERPIECE PROMPT":
1. VISUAL FIDELITY: Describe the lighting (e.g., golden hour, cinematic teal/orange, volumetric fog), camera gear (e.g., 85mm lens, f/1.8 aperture, 8k resolution, Unreal Engine 5 render style), and textures (skin pores, fabric details, glass reflections).
2. ATMOSPHERE: Describe the mood (e.g., adventurous, serene, futuristic, high-energy).
3. COMPOSITION: Describe the angle (wide shot, POV, macro) and depth of field.
4. LENGTH: The output MUST be detailed and comprehensive. Do not summarize. Since this is for DALL-E 3, be descriptive and specific.

OUTPUT FORMAT:
Return ONLY the raw enhanced prompt text. No "Here is the prompt" prefix.

Example Input: "Woman on beach"
Example Output: "${shouldBrand ? "A photorealistic 8k masterpiece shot at golden hour on a pristine Maldives beach. A young professional female traveler is relaxing on a hammock, wearing a light summer dress. In her hand, she holds a sleek modern smartphone... on the screen, the 'GateSIM' logo is glowing in white and neon blue... The lighting is soft and warm with lens flare... bokeh palm trees in background..." : "A photorealistic 8k masterpiece shot..."}"
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
