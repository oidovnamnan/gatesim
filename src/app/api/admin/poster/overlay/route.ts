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

        const { mainImage, logoImage, position } = await req.json();

        if (!mainImage || !logoImage) {
            return NextResponse.json({ error: "Missing images" }, { status: 400 });
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

        // Resize logo to ~20% of main image width or height (max)
        const targetLogoSize = Math.round(Math.min(mainWidth, mainHeight) * 0.2);
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
            case 'top-right':
                top = padding;
                left = mainWidth - logoW - padding;
                break;
            case 'bottom-left':
                top = mainHeight - logoH - padding;
                left = padding;
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

        // Composite
        const compositeBuffer = await sharp(mainImageBuffer)
            .composite([
                { input: resizedLogo, top: Math.round(top), left: Math.round(left) }
            ])
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
