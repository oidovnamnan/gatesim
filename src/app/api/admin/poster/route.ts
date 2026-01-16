import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";

export const dynamic = 'force-dynamic';

const posterPrompts: Record<string, string> = {
    morning: "Modern, sleek promotional poster for GateSIM eSIM service. Morning theme with soft golden sunrise gradient background (orange to pink). Features a stylized smartphone with eSIM chip glowing, world map connections. Japanese torii gate, Korean palace, and travel landmarks subtly integrated. Premium glassmorphism design. Text: GateSIM logo at top. Clean minimalist style for social media. No device frames.",
    evening: "Elegant night-themed promotional poster for GateSIM eSIM service. Deep purple to midnight blue gradient background with stars. Smartphone floating with glowing eSIM chip. City skyline silhouettes (Tokyo, Seoul, New York). Moonlit travel vibes. Premium dark mode aesthetic. GateSIM logo prominent. Modern, sophisticated design for social media.",
    travel: "Vibrant travel-themed promotional poster for GateSIM eSIM service. Bright blue to cyan gradient with airplane and world map. Passport stamps, famous landmarks (Eiffel Tower, Statue of Liberty, Mount Fuji) collage style. Smartphone with eSIM. Adventure and wanderlust feeling. GateSIM logo. Clean, exciting design perfect for travel enthusiasts.",
    promo: "Bold, attention-grabbing promotional poster for GateSIM eSIM service. Red to orange gradient background with fire/energy effects. Big sale vibes. Smartphone with eSIM prominently featured. Discount badges, flash sale elements. Urgent, exciting feel. GateSIM logo. Modern design that screams special offer.",
};

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
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { theme, size } = await req.json();

        if (!theme || !posterPrompts[theme]) {
            return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
        }

        const prompt = posterPrompts[theme];
        const captions = captionTemplates[theme];
        const hashtags = "#GateSIM #eSIM #Аялал #Travel #Mongolia #TravelTech #DigitalNomad";

        // For now, return the prompt and captions - actual image generation
        // would be done client-side with the generate_image tool or via an API
        return NextResponse.json({
            success: true,
            prompt,
            captionMN: captions.mn,
            captionEN: captions.en,
            hashtags,
            size,
            theme
        });

    } catch (error: any) {
        console.error("Poster generation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
