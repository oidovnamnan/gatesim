import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { auth } from "@/lib/auth";
import { getOpenAIConfig } from "@/lib/ai-config";
import { checkAILimit, incrementAIUsage } from "@/lib/ai-usage";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
        }

        // 1. Check AI Limit (using the same 'PLAN' or a new 'INFO' limit)
        const canUse = await checkAILimit(userId, "PLAN");
        if (!canUse) {
            return NextResponse.json({ success: false, error: "LIMIT_REACHED" }, { status: 403 });
        }

        const { activity, location, city, language = "mn" } = await request.json();

        if (!activity || !location) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const aiConfig = await getOpenAIConfig();
        const openai = new OpenAI({ apiKey: aiConfig.apiKey || process.env.OPENAI_API_KEY });

        const systemPrompt = `You are an expert travel guide. Provide detailed, engaging, and practical information about the following activity or location.
    Include historical context, local tips, what to look for, and a cultural note.
    
    The response MUST be a JSON object with the following structure:
    {
      "title": "Title in English",
      "titleMn": "Title in Mongolian",
      "description": "Short engaging description in English",
      "descriptionMn": "Short engaging description in Mongolian",
      "details": ["Detail 1 in English", "Detail 2"],
      "detailsMn": ["Detail 1 in Mongolian", "Detail 2"],
      "tips": ["Tip 1 in English", "Tip 2"],
      "tipsMn": ["Tip 1 in Mongolian", "Tip 2"],
      "cultureNote": "A cultural insight in English",
      "cultureNoteMn": "A cultural insight in Mongolian"
    }`;

        const userPrompt = `Activity: ${activity}
    Location: ${location}
    City: ${city || "Specified Location"}
    
    Provide the detailed information in BOTH Mongolian and English as requested in the JSON structure.`;

        const response = await openai.chat.completions.create({
            model: aiConfig.model || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || "{}";
        const data = JSON.parse(content);

        // Increment usage
        await incrementAIUsage(userId, "PLAN");

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error: any) {
        console.error("Activity info error:", error);
        return NextResponse.json({ success: false, error: "AI_ERROR" }, { status: 500 });
    }
}
