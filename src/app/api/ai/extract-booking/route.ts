import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text from PDF using PDFParse v2.4.5
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        const rawText = textResult.text;

        // Cleanup
        await parser.destroy();

        if (!rawText || rawText.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from PDF. It might be a scanned image." }, { status: 422 });
        }

        // Use AI to structure the data
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert travel assistant. Your task is to extract travel booking information from raw text and structure it as JSON.
                    
                    Return a JSON object with the following fields:
                    {
                        "type": "flight" | "hotel" | "train" | "activity",
                        "name": "Project name or Company name",
                        "location": "City, Airport code, or Address",
                        "dateTime": "ISO 8601 formatted date and time",
                        "confirmationCode": "Optional code if found",
                        "description": "Brief summary of the booking"
                    }
                    
                    If multiple bookings are found, return only the most significant one or the first one.
                    If no booking info is found, return an error object: {"error": "No booking found"}.`
                },
                {
                    role: "user",
                    content: `Extract booking info from this text: \n\n${rawText.substring(0, 4000)}` // Limit text size for safety
                }
            ],
            response_format: { type: "json_object" }
        });

        const extractedData = JSON.parse(completion.choices[0].message.content || "{}");

        if (extractedData.error) {
            return NextResponse.json({ error: extractedData.error }, { status: 422 });
        }

        return NextResponse.json({
            success: true,
            data: extractedData
        });

    } catch (error) {
        console.error("OCR Extraction Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
