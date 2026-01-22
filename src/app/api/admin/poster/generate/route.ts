import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for image generation

// Poster prompts for different themes
const posterPrompts: Record<string, string> = {
    morning: "Modern promotional poster for GateSIM eSIM travel service. Morning theme with golden sunrise gradient (orange to pink). A smartphone with glowing eSIM chip floating over a world map. Travel landmarks like torii gate, Eiffel Tower subtly integrated. Silver infinity loop logo at top with 'GateSIM' text. Premium glassmorphism design. Clean minimalist style. Square format 1024x1024.",
    evening: "Elegant night promotional poster for GateSIM eSIM service. Deep purple to midnight blue gradient with stars and aurora. Smartphone with eSIM chip glowing. City skylines (Tokyo, Seoul, Shanghai) silhouettes. Silver infinity loop logo with 'GateSIM' text. Modern dark mode aesthetic. Square format 1024x1024.",
    travel: "Vibrant travel poster for GateSIM eSIM service. Bright blue sky with airplane flying over world map. Famous landmarks (Eiffel Tower, Mount Fuji, Great Wall) on clouds. Smartphone with eSIM chip. Silver infinity loop logo with 'GateSIM' text. Adventure wanderlust feeling. Square format 1024x1024.",
    promo: "Bold sale poster for GateSIM eSIM service. Red to orange fire gradient with sparks. Smartphone with glowing eSIM. Discount star burst elements. Silver infinity loop logo with 'GateSIM' text. Flash sale urgent feel. Square format 1024x1024."
};

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

        const { theme, size } = await req.json();

        if (!theme || !posterPrompts[theme]) {
            return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
        }

        // Get API key - check env first, then Firebase config
        let openaiApiKey = process.env.OPENAI_API_KEY;

        if (!openaiApiKey) {
            // Fallback to Firebase config if env not set
            const configRef = doc(db, "system", "config");
            const configSnap = await getDoc(configRef);
            const config = configSnap.data() || {};
            openaiApiKey = config.openaiApiKey;
        }

        // For now, only OpenAI is implemented
        if (!openaiApiKey) {
            // Return static poster if no API key
            return NextResponse.json({
                success: true,
                imageUrl: `/posters/${theme}.png`,
                captionMN: captionTemplates[theme]?.mn || "",
                captionEN: captionTemplates[theme]?.en || "",
                hashtags: "#GateSIM #eSIM #Аялал #Travel #Mongolia #TravelTech #DigitalNomad",
                generated: false,
                message: "API key тохируулаагүй тул бэлэн зураг ашиглав"
            });
        }

        // Generate with OpenAI DALL-E
        const openai = new OpenAI({ apiKey: openaiApiKey });

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: posterPrompts[theme],
            n: 1,
            size: "1024x1024",
            quality: "standard",
        });

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) {
            throw new Error("Failed to generate image");
        }

        return NextResponse.json({
            success: true,
            imageUrl,
            captionMN: captionTemplates[theme]?.mn || "",
            captionEN: captionTemplates[theme]?.en || "",
            hashtags: "#GateSIM #eSIM #Аялал #Travel #Mongolia #TravelTech #DigitalNomad",
            generated: true,
            message: "AI зураг амжилттай үүслээ"
        });

    } catch (error: any) {
        console.error("Poster generation error:", error);
        return NextResponse.json({
            error: error.message || "Image generation failed",
            details: error.toString()
        }, { status: 500 });
    }
}
