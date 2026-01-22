import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for image generation

// --- Advanced Prompt Engineering System ---

const basePrompt = "Professional high-end advertising poster for 'GateSIM' travel internet service. 8k resolution, highly detailed, photorealistic, cinematic lighting, commercial photography.";

const themes = {
    morning: {
        lighting: "Golden hour sunrise lighting, warm soft shadows, orange and teal color grading, hopeful atmosphere",
        scene: "A modern smartphone with a glowing holographic eSIM chip floating above a map of Asia representing connectivity. In the background, a subtle blend of Mount Fuji and a modern airport terminal.",
        style: "Clean, minimalist, premium tech aesthetic, glassmorphism elements, Apple-style advertising"
    },
    evening: {
        lighting: "Cyberpunk influenced night lighting, neon blue and purple accents, deep contrast, dramatic shadows",
        scene: "A traveler's hand holding a smartphone showing high speed connection. Background is a bokeh-blurred night cityscape of Tokyo or Seoul with vibrant street lights.",
        style: "Modern, sleek, futuristic, high-tech, night mode aesthetic"
    },
    travel: {
        lighting: "Bright daylight, high exposure, vivid colors, polarized blue sky",
        scene: "First-person POV of a traveler holding a passport and phone at a breathtaking scenic overlook (Swiss Alps or tropical beach). The phone screen displays 'Connected' with the GateSIM logo.",
        style: "Wanderlust, adventurous, energetic, travel blog aesthetic, vibrant and airy"
    },
    promo: {
        lighting: "Dynamic studio lighting, rim lighting, energetic red and orange hues",
        scene: "3D abstract composition showing a burst of speed and data. A smartphone cutting through the air with speed lines. Floating discount percentage tags nicely integrated.",
        style: "Bold, urgent, high-energy sales graphic, 3D render style, commercial sale aesthetic"
    }
};

const technicalQualityKeywords = "Unreal Engine 5 render, Octane Render, Ray Tracing, 8k, ultra-sharp focus, commercial quality, masterpiece.";

// Text generation instruction for DALL-E 3
const textInstruction = "The text 'GateSIM' must be clearly visible, spelled correctly, and integrated professionally into the design (e.g., as a 3D logo or confident headline). No other gibberish text.";

function buildPrompt(theme: string): string {
    const selectedTheme = themes[theme as keyof typeof themes] || themes.morning;

    return `${basePrompt}
    
Theme: ${theme.toUpperCase()}
Lighting: ${selectedTheme.lighting}
Scene Description: ${selectedTheme.scene}
Style: ${selectedTheme.style}

Technical Specs: ${technicalQualityKeywords}

IMPORTANT: ${textInstruction}`;
}

// Caption templates
const captionTemplates: Record<string, { mn: string; en: string }> = {
    morning: {
        mn: "🌅 Өглөөний мэнд!\n\n✈️ Аялалаа төлөвлөж байна уу?\n📱 GateSIM-ээр 200+ улсад интернет!\n\n💰 Хамгийн хямд үнэ\n⚡ Шууд идэвхжинэ\n🔒 Байнгын холболт\n\n👉 gatesim.travel",
        en: "🌅 Good morning!\n\n✈️ Planning your next trip?\n📱 Stay connected in 200+ countries with GateSIM!\n\n💰 Best prices\n⚡ Instant activation\n🔒 Reliable connection\n\n👉 gatesim.travel"
    },
    evening: {
        mn: "🌙 Сайн оройн мэнд!\n\n🌍 Маргааш аялалд гарах уу?\n📱 GateSIM таны хамгийн найдвартай интернет!\n\n✨ 200+ улс\n💳 QPay төлбөр\n📞 24/7 дэмжлэг\n\n👉 gatesim.travel",
        en: "🌙 Good evening!\n\n🌍 Traveling tomorrow?\n📱 GateSIM - Your reliable travel companion!\n\n✨ 200+ countries\n💳 Easy payment\n📞 24/7 support\n\n👉 gatesim.travel"
    },
    travel: {
        mn: "✈️ Аялал таны хүлээж байна!\n\n🌏 200+ улсад интернет\n📱 eSIM - физик карт шаардлагагүй\n\n💰 Хямд үнэ\n⚡ Минутанд идэвхжинэ\n🔒 Найдвартай холболт\n\n👉 gatesim.travel",
        en: "✈️ Adventure awaits!\n\n🌏 Stay connected in 200+ countries\n📱 eSIM - No physical SIM needed\n\n💰 Affordable prices\n⚡ Activate in minutes\n🔒 Reliable connection\n\n👉 gatesim.travel"
    },
    promo: {
        mn: "🔥 ОНЦГОЙ САНАЛ!\n\n🎯 Энэ 7 хоногт л!\n📱 Бүх багц -20% хямдралтай\n\n💰 ₮5,000-с эхлэн\n✈️ Япон, Солонгос, Хятад\n⚡ Шууд идэвхжинэ\n\n👉 gatesim.travel",
        en: "🔥 SPECIAL OFFER!\n\n🎯 This week only!\n📱 All packages 20% OFF\n\n💰 Starting from $5\n✈️ Japan, Korea, China & more\n⚡ Instant activation\n\n👉 gatesim.travel"
    }
};

export async function POST(req: NextRequest) {
    try {
        // Auth check
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { theme, customPrompt, captionTone, captionLength } = await req.json();

        // Determine final prompt
        let finalPrompt = "";

        if (customPrompt) {
            finalPrompt = customPrompt;
        } else if (theme && themes[theme as keyof typeof themes]) {
            finalPrompt = buildPrompt(theme);
        } else {
            return NextResponse.json({ error: "Invalid theme or missing prompt" }, { status: 400 });
        }

        // Get API key
        let openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            const configRef = doc(db, "system", "config");
            const configSnap = await getDoc(configRef);
            openaiApiKey = configSnap.data()?.openaiApiKey;
        }

        if (!openaiApiKey) {
            // Fallback for demo if no key
            if (theme) {
                return NextResponse.json({
                    success: true,
                    imageUrl: `/posters/${theme}.png`,
                    captionMN: captionTemplates[theme]?.mn || "",
                    captionEN: captionTemplates[theme]?.en || "",
                    hashtags: "#GateSIM #eSIM #Аялал",
                    generated: false,
                    message: "API key дутуу тул бэлэн зураг ашиглав"
                });
            }
            return NextResponse.json({ error: "OpenAI API Key missing" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiApiKey });

        // 1. Generate Image
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: finalPrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
        });

        const imageUrl = imageResponse.data?.[0]?.url;

        if (!imageUrl) {
            throw new Error("Failed to generate image");
        }

        // 2. Generate Caption (Dynamic)
        const toneInstruction = captionTone || "Promotional";
        const lengthInstruction = captionLength === "short" ? "very short (1-2 sentences)" : captionLength === "long" ? "long and storytelling (2 paragraphs)" : "medium length";

        const captionSystemPrompt = `You are a social media manager for GateSIM. Write a captivating Facebook/Instagram caption based on the image description.
        
Brand Voice: Professional, Adventurous, Helpful.
Key Info: 200+ countries, Instant eSIM delivery, Affordable rates.

Instructions:
- Tone: ${toneInstruction}
- Length: ${lengthInstruction}
- Return JSON: { "mn": "Mongolian text...", "en": "English text...", "hashtags": "#tags..." }`;

        const captionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: captionSystemPrompt },
                { role: "user", content: `Image Description: ${finalPrompt}` }
            ],
            response_format: { type: "json_object" }
        });

        const captionData = JSON.parse(captionResponse.choices[0]?.message?.content || "{}");

        return NextResponse.json({
            success: true,
            imageUrl,
            captionMN: captionData.mn || captionTemplates[theme as keyof typeof themes]?.mn || "Caption generation failed",
            captionEN: captionData.en || captionTemplates[theme as keyof typeof themes]?.en || "",
            hashtags: captionData.hashtags || "#GateSIM #Travel",
            generated: true,
            message: "AI контент амжилттай үүслээ",
            debugPrompt: finalPrompt.substring(0, 100) + "..."
        });

    } catch (error: any) {
        console.error("Poster generation error:", error);
        return NextResponse.json({
            error: error.message || "Image generation failed",
            details: error.toString()
        }, { status: 500 });
    }
}
