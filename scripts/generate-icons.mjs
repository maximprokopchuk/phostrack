import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dir, '../public/icon.svg'));

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(__dir, `../public/icon-${size}.png`));
  console.log(`✓ icon-${size}.png`);
}

// Apple touch icon (180x180)
await sharp(svg)
  .resize(180, 180)
  .png()
  .toFile(join(__dir, '../public/apple-touch-icon.png'));
console.log('✓ apple-touch-icon.png');
