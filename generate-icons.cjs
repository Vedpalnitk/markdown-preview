// Simple icon generator for PWA
// This creates SVG icons that can be converted to PNG

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon for each size
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradient background -->
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0052CC;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1A8CFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00D4FF;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${size}">
      <feDropShadow dx="0" dy="${size * 0.05}" stdDeviation="${size * 0.03}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>

  <!-- Glass note icon -->
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Note page -->
    <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.4}" height="${size * 0.5}" rx="${size * 0.03}"
          fill="white" opacity="0.95" filter="url(#shadow${size})"/>

    <!-- Lines on note -->
    <line x1="${size * 0.15}" y1="${size * 0.15}" x2="${size * 0.45}" y2="${size * 0.15}"
          stroke="#0052CC" stroke-width="${size * 0.01}" opacity="0.6"/>
    <line x1="${size * 0.15}" y1="${size * 0.25}" x2="${size * 0.45}" y2="${size * 0.25}"
          stroke="#0052CC" stroke-width="${size * 0.01}" opacity="0.6"/>
    <line x1="${size * 0.15}" y1="${size * 0.35}" x2="${size * 0.38}" y2="${size * 0.35}"
          stroke="#0052CC" stroke-width="${size * 0.01}" opacity="0.6"/>

    <!-- Glass effect overlay -->
    <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.4}" height="${size * 0.25}" rx="${size * 0.03}"
          fill="white" opacity="0.2"/>
  </g>
</svg>`;

  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`✓ Created icon-${size}x${size}.svg`);
});

console.log('\n✅ All icons generated successfully!');
console.log('\nNote: SVG icons work for PWA. For best compatibility, convert to PNG using:');
console.log('  - Online tool: https://cloudconvert.com/svg-to-png');
console.log('  - Or install imagemagick and run: npm run convert-icons');
