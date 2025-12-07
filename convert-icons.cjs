const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

async function convertIcons() {
  console.log('Converting SVG icons to PNG...\n');

  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      console.log(`✓ Converted icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Error converting ${size}x${size}:`, error.message);
    }
  }

  console.log('\n✅ All icons converted to PNG!');
}

convertIcons();
