import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/lib/auth";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "No image provided" },
                { status: 400 }
            );
        }

        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
        }

        // 1. Check AI Limit
        const canUse = await checkAILimit(userId, "POSTER");
        if (!canUse) {
            return NextResponse.json({
                success: false,
                error: "LIMIT_REACHED",
                message: "Poster/Memory Art limit reached. Please upgrade to Premium."
            }, { status: 403 });
        }

        // For now, we'll use a simple approach
        // In production, you could use specialized image enhancement APIs
        // like Cloudinary, imgix, or call DALL-E for inpainting/outpainting

        // Option 1: Use GPT-4 Vision to analyze and suggest improvements
        // Then apply CSS-like filters based on the analysis

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an image analysis expert. Analyze the travel photo and suggest which enhancement would look best.
Return ONLY a JSON object with:
{
  "brightness": number between 0.9-1.3,
  "contrast": number between 0.9-1.3,
  "saturate": number between 1.0-1.5,
  "suggestion": "Brief suggestion in Mongolian about what makes this photo special"
}`
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this travel photo and suggest enhancements:"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                                detail: "low"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 200,
        });

        const content = response.choices[0]?.message?.content || "";

        let analysis;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                brightness: 1.05,
                contrast: 1.1,
                saturate: 1.2,
                suggestion: "Гоё аялалын зураг байна!"
            };
        } catch {
            analysis = {
                brightness: 1.05,
                contrast: 1.1,
                saturate: 1.2,
                suggestion: "Зураг сайжруулагдлаа"
            };
        }

        // Since we can't actually modify the image server-side without additional libraries,
        // we'll return the analysis for client-side CSS filter application
        // The client will apply filters based on these values

        return NextResponse.json({
            success: true,
            enhancedImage: image, // Return original, client applies filters
            enhancement: {
                filter: `brightness(${analysis.brightness}) contrast(${analysis.contrast}) saturate(${analysis.saturate})`,
                suggestion: analysis.suggestion,
            },
        });
    } finally {
        const session = await auth();
        if (session?.user?.id) {
            await incrementAIUsage(session.user.id, "POSTER");
        }
    }
}
