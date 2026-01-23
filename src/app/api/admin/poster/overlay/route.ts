import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/config/admin";
import sharp from "sharp";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { mainImage, logoImage, position, text, textColor, fontSize, logoScale = 0.2 } = await req.json();

        if (!mainImage && !logoImage && !text) {
            return NextResponse.json({ error: "No content to overlay" }, { status: 400 });
        }

        // Fetch main image (it's a URL)
        const mainImageRes = await fetch(mainImage);
        const mainImageBuffer = await mainImageRes.arrayBuffer();

        // Handle Logo Image (Base64 or Local Path)
        let logoBuffer: Buffer;
        if (logoImage.startsWith('data:')) {
            logoBuffer = Buffer.from(logoImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        } else {
            // Assume it's a public path
            const path = require('path');
            const fs = require('fs/promises');
            const publicPath = path.join(process.cwd(), 'public', logoImage.startsWith('/') ? logoImage.slice(1) : logoImage);
            logoBuffer = await fs.readFile(publicPath);
        }

        // Main image metadata
        const mainMeta = await sharp(mainImageBuffer).metadata();
        const mainWidth = mainMeta.width || 1024;
        const mainHeight = mainMeta.height || 1024;

        // Resize logo based on logoScale
        const targetLogoSize = Math.round(Math.min(mainWidth, mainHeight) * logoScale);
        const resizedLogo = await sharp(logoBuffer)
            .resize({ width: targetLogoSize, fit: 'contain' })
            .toBuffer();

        const logoMeta = await sharp(resizedLogo).metadata();
        const logoW = logoMeta.width || targetLogoSize;
        const logoH = logoMeta.height || targetLogoSize;

        // Calculate positions
        const padding = 50;
        let top = padding;
        let left = padding;

        switch (position) {
            case 'top-left':
                top = padding;
                left = padding;
                break;
            case 'top-center':
                top = padding;
                left = (mainWidth - logoW) / 2;
                break;
            case 'top-right':
                top = padding;
                left = mainWidth - logoW - padding;
                break;
            case 'bottom-left':
                top = mainHeight - logoH - padding;
                left = padding;
                break;
            case 'bottom-center':
                top = mainHeight - logoH - padding;
                left = (mainWidth - logoW) / 2;
                break;
            case 'bottom-right':
                top = mainHeight - logoH - padding;
                left = mainWidth - logoW - padding;
                break;
            case 'center':
                top = (mainHeight - logoH) / 2;
                left = (mainWidth - logoW) / 2;
                break;
            default: // bottom-right
                top = mainHeight - logoH - padding;
                left = mainWidth - logoW - padding;
        }

        // 5. Prepare Composites array
        const composites: any[] = [];

        if (logoBuffer) {
            composites.push({ input: resizedLogo, top: Math.round(top), left: Math.round(left) });
        }

        // 6. Handle Text Overlay (SVG)
        if (text) {
            const fSize = fontSize || Math.round(mainWidth * 0.05);
            const color = textColor || "#ffffff";

            // Simple SVG text wrap or single line
            const svgText = `
                <svg width="${mainWidth}" height="${mainHeight}">
                    <style>
                        .title { fill: ${color}; font-size: ${fSize}px; font-weight: bold; font-family: sans-serif; }
                    </style>
                    <text x="50%" y="50%" text-anchor="middle" class="title">${text}</text>
                </svg>
            `;

            // Actually, we should position the text based on requested 'position' too, 
            // but for a start let's put it in the composite relative to the same logic or separate.
            // Let's reuse position but with padding offsets.

            let textTop = top;
            let textLeft = left;

            // If logo exists, offset text so they don't overlap too much, or just use the same position logic
            // for now let's just center text if it's substantial, or follow the same corner logic.

            const textBuffer = Buffer.from(svgText);
            composites.push({ input: textBuffer, top: 0, left: 0 }); // SVG covers full canvas
        }

        // Composite
        const compositeBuffer = await sharp(mainImageBuffer)
            .composite(composites)
            .toBuffer();

        // Convert back to base64
        const compositeBase64 = `data:image/png;base64,${compositeBuffer.toString('base64')}`;

        // In a real app, upload to S3/Firebase Storage here. 
        // For now, return base64 (client can download it).

        return NextResponse.json({
            success: true,
            imageUrl: compositeBase64
        });

    } catch (error: any) {
        console.error("Overlay error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
