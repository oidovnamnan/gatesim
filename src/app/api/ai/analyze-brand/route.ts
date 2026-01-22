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

        const { image } = await req.json(); // Base64 image string

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        // Get API key
        let openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            const configRef = doc(db, "system", "config");
            const configSnap = await getDoc(configRef);
            openaiApiKey = configSnap.data()?.openaiApiKey;
        }

        if (!openaiApiKey) {
            return NextResponse.json({ error: "OpenAI API Key missing" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey: openaiApiKey });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert Brand Identity Specialist. Your job is to describe a logo in extreme detail so that DALL-E 3 can recreate it as accurately as possible within a scene.
                    
                    Focus on:
                    1. Exact Shapes & Geometry (e.g. "a hexagon with rounded corners", "three intersecting circles")
                    2. Colors (use accurate names like "vibrant tangerine orange", "deep navy blue")
                    3. Typography style (e.g. "bold sans-serif font similar to Montserrat", "handwritten script")
                    4. Layout (e.g. "icon on the left, text on the right")
                    
                    Output only the description paragraph. Keep it concise but precise.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Describe this logo for DALL-E generation:" },
                        {
                            type: "image_url",
                            image_url: {
                                "url": image, // Expecting data URI
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });

        const description = response.choices[0]?.message?.content || "";

        return NextResponse.json({ description });

    } catch (error: any) {
        console.error("Brand analysis error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
