import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');

async function optimizeImages(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await optimizeImages(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      const fileNameNoExt = path.parse(file).name;

      // EXCEPTION: Always keep qris.png as PNG
      if (file.toLowerCase() === 'qris.png') {
        console.log(`Skipping: ${file} (User Exception)`);
        continue;
      }

      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        const targetPath = path.join(directory, `${fileNameNoExt}.webp`);
        console.log(`Processing: ${file}...`);

        try {
          const inputBuffer = fs.readFileSync(fullPath);
          const buffer = await sharp(inputBuffer)
            .resize({ width: 1080, withoutEnlargement: true, fit: 'inside' })
            .webp({ quality: 70 })
            .toBuffer();

          fs.writeFileSync(targetPath, buffer);
          fs.unlinkSync(fullPath);
          console.log(`  ✓ Converted to WebP and removed original.`);
        } catch (err) {
          console.error(`  × Error processing ${file}:`, err.message);
        }
      } else if (ext === '.webp') {
        // Optimize existing WebP if too large
        console.log(`Optimizing: ${file}...`);
        try {
          const inputBuffer = fs.readFileSync(fullPath);
          const buffer = await sharp(inputBuffer)
            .resize({ width: 1080, withoutEnlargement: true, fit: 'inside' })
            .webp({ quality: 70 })
            .toBuffer();
          fs.writeFileSync(fullPath, buffer);
          console.log(`  ✓ Optimized existing WebP.`);
        } catch (err) {
          console.error(`  × Error processing ${file}:`, err.message);
        }
      }
    }
  }
}

console.log('--- STARTING IMAGE OPTIMIZATION (EXCLUDING QRIS.PNG) ---');
optimizeImages(PUBLIC_DIR)
  .then(() => console.log('--- ALL IMAGES OPTIMIZED ---'))
  .catch(err => console.error('FATAL ERROR:', err));
