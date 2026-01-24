import { OpenAI } from "openai";
import { auth } from "@/lib/auth";

export const maxDuration = 60; // Allow longer timeout for vision processing

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow guests to try it out too, or restrict? Let's allow for now as a hook.

        const { image } = await req.json();

        if (!image) {
            return Response.json({ error: "No image provided" }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using mini for cost efficiency, capable enough for OCR
            messages: [
                {
                    role: "system",
                    content: `You are a receipt scanner API. 
                    Analyze the provided image and extract expense details. 
                    Return ONLY a JSON object with this structure:
                    {
                        "merchant": "Store Name",
                        "date": "YYYY-MM-DD",
                        "amount": 1000,
                        "currency": "MNT",
                        "category": "Food" | "Transport" | "Shopping" | "Entertainment" | "Other"
                    }
                    If currency symbol is used (₮, ¥, $, ₩), convert to ISO code (MNT, JPY, USD, KRW).
                    If amount is in thousands (e.g. 5.0, 5,000) but looks like MNT, assume MNT.
                    If date is missing, use today's date.
                    If unsure, use "Other" category.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Scan this receipt." },
                        {
                            type: "image_url",
                            image_url: {
                                url: image, // Expecting base64 data url
                                detail: "low" // Low detail is usually enough for text and saves tokens
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("No response from AI");
        }

        return Response.json(JSON.parse(result));

    } catch (error) {
        console.error("OCR Error:", error);
        return Response.json({ error: "Failed to process image" }, { status: 500 });
    }
}
