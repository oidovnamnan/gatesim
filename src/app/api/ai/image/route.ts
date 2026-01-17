import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Destination prompts
const destinationPrompts: Record<string, string> = {
    JP: "iconic Japanese scenery with Mount Fuji, cherry blossoms, torii gates, and traditional temples",
    KR: "beautiful Korean landscape with traditional palaces, N Seoul Tower, hanok villages, and autumn foliage",
    TH: "stunning Thai scenery with golden temples, tropical beaches, floating markets, and lush jungles",
    CN: "majestic Chinese landmarks with the Great Wall, Forbidden City, traditional gardens, and misty mountains",
    SG: "futuristic Singapore skyline with Marina Bay Sands, Gardens by the Bay, and modern architecture",
};

// Style modifiers
const styleModifiers: Record<string, string> = {
    modern: "clean modern design, contemporary aesthetic, bold colors, professional travel poster style",
    vintage: "vintage retro travel poster style from 1950s, muted colors, art deco influences, nostalgic feel",
    minimalist: "minimalist design, simple clean lines, limited color palette, elegant and sophisticated",
    vibrant: "vibrant colorful design, dynamic composition, energetic feel, eye-catching and bold",
};

// Aspect ratios
const aspectRatios: Record<string, "1024x1024" | "1792x1024" | "1024x1792"> = {
    postcard: "1792x1024",
    story: "1024x1792",
    square: "1024x1024",
    poster: "1024x1792",
};

export async function POST(request: NextRequest) {
    try {
        const { destination, template, style, customPrompt, language } = await request.json();

        if (!destination) {
            return NextResponse.json(
                { success: false, error: "Missing destination" },
                { status: 400 }
            );
        }

        const destinationDesc = destinationPrompts[destination] || "beautiful travel destination scenery";
        const styleDesc = styleModifiers[style] || styleModifiers.modern;
        const size = aspectRatios[template] || "1024x1024";

        // Build the prompt
        let prompt = `Create a stunning travel poster featuring ${destinationDesc}. 
Style: ${styleDesc}. 
The image should be visually striking, suitable for a travel advertisement.
No text or words in the image.`;

        if (customPrompt) {
            prompt += ` Additional details: ${customPrompt}`;
        }

        // Generate image with DALL-E 3
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size,
            quality: "standard",
        });

        const imageUrl = response.data[0]?.url;

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: "No image generated" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            imageUrl,
            prompt: prompt.substring(0, 200),
        });
    } catch (error) {
        console.error("Image generation error:", error);
        return NextResponse.json(
            { success: false, error: "Image generation failed" },
            { status: 500 }
        );
    }
}
