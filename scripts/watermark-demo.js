const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
    const mainImagePath = '/Users/suren/.gemini/antigravity/brain/f555f01d-5c20-4c54-8633-84ca01435304/gatesim_airport_base_1769097123502.png';
    const logoPath = 'public/logo-official-full.jpg';
    const outputPath = '/Users/suren/.gemini/antigravity/brain/f555f01d-5c20-4c54-8633-84ca01435304/gatesim_airport_final.png';

    console.log('Watermarking...');

    const mainImage = sharp(mainImagePath);
    const mainMeta = await mainImage.metadata();

    // Resize logo to 30% of width (made it slightly bigger for visibility)
    const logoWidth = Math.round(mainMeta.width * 0.30);
    const logo = sharp(logoPath).resize({ width: logoWidth });
    const logoBuffer = await logo.toBuffer();
    const logoMeta = await sharp(logoBuffer).metadata();

    // Calc position (Bottom Right)
    const padding = Math.round(mainMeta.width * 0.05);
    const left = mainMeta.width - logoWidth - padding;
    const top = mainMeta.height - logoMeta.height - padding;

    await mainImage
        .composite([{ input: logoBuffer, top, left }])
        .toFile(outputPath);

    console.log('Success: ' + outputPath);
}

main().catch(console.error);
