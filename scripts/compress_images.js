import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '../public/images');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.webp'];

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) return;

  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);

  // Jika file sudah kecil (< 100KB), lewati kecuali PNG besar
  if (fileSizeInMB < 0.1 && ext === '.webp') return;

  const tempFilePath = `${filePath}.temp`;
  
  try {
    let pipeline = sharp(filePath);
    
    // Resize jika terlalu besar (Max 1200px width untuk mobile-first)
    const metadata = await pipeline.metadata();
    if (metadata.width > 1200) {
      pipeline = pipeline.resize(1200);
    }

    if (ext === '.webp') {
      await pipeline.webp({ quality: 75, effort: 6 }).toFile(tempFilePath);
    } else if (ext === '.png') {
      await pipeline.png({ quality: 80, compressionLevel: 9, effort: 10 }).toFile(tempFilePath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: 80, mozjpeg: true }).toFile(tempFilePath);
    }

    const newStats = fs.statSync(tempFilePath);
    if (newStats.size < stats.size) {
      fs.renameSync(tempFilePath, filePath);
      console.log(`✅ Compressed: ${path.relative(IMAGES_DIR, filePath)} (${(fileSizeInMB * 1024).toFixed(2)}KB -> ${(newStats.size / 1024).toFixed(2)}KB)`);
    } else {
      fs.unlinkSync(tempFilePath);
      console.log(`ℹ️ Skipped (already optimized): ${path.relative(IMAGES_DIR, filePath)}`);
    }
  } catch (err) {
    console.error(`❌ Error compressing ${filePath}:`, err.message);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await walkDir(fullPath);
    } else {
      await compressImage(fullPath);
    }
  }
}

console.log('🚀 Starting image compression...');
walkDir(IMAGES_DIR).then(() => {
  console.log('✨ Image compression finished!');
}).catch(err => {
  console.error('💥 Crash:', err);
});
