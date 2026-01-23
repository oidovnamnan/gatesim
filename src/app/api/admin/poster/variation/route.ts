import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const imageFile = formData.get("image") as File;

        // We use size from formData or default to square. 
        // Note: Imagen 3 supports specific aspect ratios.
        const size = (formData.get("size") as string) || "1:1";

        if (!imageFile) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // Get API Key and Config
        const configRef = doc(db, "system", "config");
        const configSnap = await getDoc(configRef);
        const config = configSnap.data() || {};

        const googleKey = process.env.GOOGLE_API_KEY || config.googleApiKey;

        if (!googleKey) {
            return NextResponse.json({ error: "Google API Key missing" }, { status: 500 });
        }

        // --- STEP 1: ANALYZE IMAGE WITH GEMINI FLASH (Smart Vision) ---
        const genAI = new GoogleGenerativeAI(googleKey);
        const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const visionPrompt = `Analyze this image in extreme detail to create a prompt for an AI image generator (Imagen 3).
        
        1. Describe the main subject, composition, and lighting.
        2. If there is valid text like "GateSIM" or country names, include them in the description as 'text "GateSIM"'.
        3. Ignore artifacts or QR codes if they look messy, but describe the intended layout.
        4. Output ONLY the detailed prompt string, nothing else.`;

        const visionResult = await visionModel.generateContent([
            visionPrompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: imageFile.type || "image/png"
                }
            }
        ]);

        const detailedPrompt = visionResult.response.text();
        console.log("Gemini Vision Prompt:", detailedPrompt);

        // --- STEP 2: GENERATE NEW IMAGE WITH IMAGEN 3 ---
        // Using the existing Imagen calling logic from the generate route
        const configModelId = config.googleModelId || "imagen-3.0-generate-001";
        const modelIdRaw = (process.env.GOOGLE_MODEL_ID || configModelId).trim();
        const fullModelName = modelIdRaw.startsWith("models/") ? modelIdRaw : `models/${modelIdRaw}`;

        // Map size "1024x1024" to aspect ratio "1:1" if needed
        let aspectRatio = "1:1";
        if (size.includes("1792")) aspectRatio = "9:16";
        if (size.includes("1792") && size.startsWith("1792")) aspectRatio = "16:9";
        if (size === "9:16" || size === "16:9" || size === "4:3" || size === "3:4") aspectRatio = size;

        const imagenResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fullModelName}:predict?key=${googleKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: detailedPrompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: aspectRatio,
                    outputMimeType: "image/png"
                }
            })
        });

        if (!imagenResponse.ok) {
            const err = await imagenResponse.json();
            throw new Error(`Imagen Generation Failed: ${err.error?.message || JSON.stringify(err)}`);
        }

        const imagenData = await imagenResponse.json();
        const b64 = imagenData.predictions?.[0]?.bytesBase64Encoded;

        if (!b64) throw new Error("No image returned from Google Imagen");

        const imageUrl = `data:image/png;base64,${b64}`;

        // --- STEP 3: GENERATE CAPTION (using Gemini Flash is cheaper/faster than OpenAI) ---
        // Or strictly strictly use standard text model
        const captionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const captionResult = await captionModel.generateContent(`
            You are a social media manager for GateSIM. 
            Based on this image description: "${detailedPrompt}"
            
            Write a travel caption.
            Return ONLY valid JSON: { "mn": "...", "en": "...", "hashtags": "..." }
        `);

        let captionData = {};
        try {
            const text = captionResult.response.text();
            // Clean markdown json blocks if present
            const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
            captionData = JSON.parse(jsonText);
        } catch (e) {
            console.error("Caption parse error", e);
            captionData = { mn: "Тайлбар үүсгэж чадсангүй", en: "Caption failed", hashtags: "#GateSIM" };
        }

        return NextResponse.json({
            success: true,
            imageUrl,
            captionMN: (captionData as any).mn || "Gemini Variation",
            captionEN: (captionData as any).en || "Gemini Variation",
            hashtags: (captionData as any).hashtags || "#GateSIM #AI",
            provider: "google-gemini", // Frontend can show "Google Imagen"
            message: "Gemini High-Fidelity Variation Created"
        });

    } catch (error: any) {
        console.error("Gemini Variation error:", error);
        return NextResponse.json({
            error: error.message || "Variation generation failed"
        }, { status: 500 });
    }
}
