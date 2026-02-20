#!/usr/bin/env node
/**
 * Generate PWA icon PNGs from favicon.svg using sharp.
 *
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SVG_PATH = resolve(ROOT, 'public/favicon.svg');
const OUT_DIR = resolve(ROOT, 'public/icons');

// Ensure output directory exists
mkdirSync(OUT_DIR, { recursive: true });

const svgBuffer = readFileSync(SVG_PATH);

/**
 * Render the SVG at a given size.
 * For maskable icons, we add padding so the safe zone (inner 80%) contains the logo.
 */
async function renderIcon(size, filename, maskable = false) {
  const outPath = resolve(OUT_DIR, filename);

  if (maskable) {
    // Maskable icons: the visible safe area is 80% of the icon (inner circle).
    // We render the SVG at 80% of the target size, then composite onto a
    // background with the primary gradient colour.
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round((size - innerSize) / 2);

    const innerPng = await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 108, g: 92, b: 231, alpha: 1 }, // #6C5CE7
      },
    })
      .composite([{ input: innerPng, left: padding, top: padding }])
      .png()
      .toFile(outPath);
  } else {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
  }

  console.log(`  ✓ ${filename} (${size}x${size}${maskable ? ', maskable' : ''})`);
}

console.log('Generating PWA icons from favicon.svg...\n');

await Promise.all([
  renderIcon(192, 'icon-192.png'),
  renderIcon(512, 'icon-512.png'),
  renderIcon(192, 'icon-maskable-192.png', true),
  renderIcon(512, 'icon-maskable-512.png', true),
  renderIcon(180, 'apple-touch-icon.png'),
]);

console.log('\nDone! Icons written to public/icons/');
