import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import path from "path";
import fs from "fs/promises";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const { imageUrl, captionMN, captionEN, hashtags, provider, idea, prompt } = data;

        if (!imageUrl) {
            return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
        }

        // 1. Prepare file system path
        const postersDir = path.join(process.cwd(), 'public', 'posters');
        try {
            await fs.access(postersDir);
        } catch {
            await fs.mkdir(postersDir, { recursive: true });
        }

        // 2. Download and save the image
        const timestamp = Date.now();
        const fileName = `poster_${provider}_${timestamp}.png`;
        const filePath = path.join(postersDir, fileName);

        let buffer: Buffer;
        if (imageUrl.startsWith('data:')) {
            // Handle Base64
            buffer = Buffer.from(imageUrl.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        } else {
            // Handle Remote URL
            const res = await fetch(imageUrl);
            const arrayBuffer = await res.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        }

        await fs.writeFile(filePath, buffer);

        // 3. Save metadata to Firestore
        const relativePath = `/posters/${fileName}`;
        const hubRef = collection(db, "ai_hub");

        const docRef = await addDoc(hubRef, {
            imageUrl: relativePath,
            captionMN,
            captionEN,
            hashtags,
            provider,
            idea,
            prompt,
            createdAt: serverTimestamp(),
            createdBy: session.user.email
        });

        return NextResponse.json({
            success: true,
            id: docRef.id,
            savedUrl: relativePath
        });

    } catch (error: any) {
        console.error("Hub save error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
