import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/fotos');
const outputDir = path.join(__dirname, '../public/fotos_optimized');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  const files = fs.readdirSync(inputDir);
  
  console.log(`Encontradas ${files.length} imagens. Iniciando otimização brutal...`);
  
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;

    const inputPath = path.join(inputDir, file);
    let baseName = file;
    baseName = baseName.replace(/\.(jpg|jpeg|png)$/i, '');
    baseName = baseName.replace(/\.(jpg|jpeg|png)$/i, ''); 
    const outputPath = path.join(outputDir, `${baseName}.webp`);

    try {
      const stats = fs.statSync(inputPath);
      totalOriginalSize += stats.size;

      await sharp(inputPath)
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      totalNewSize += newStats.size;

      console.log(`✅ Otimizada: ${file} -> ${(stats.size / 1024 / 1024).toFixed(2)}MB para ${(newStats.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (err) {
      console.error(`❌ Erro ao processar ${file}:`, err);
    }
  }

  console.log('----------------------------------------------------');
  console.log(`Peso Original Total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Novo Peso Total: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Redução de: ${((1 - (totalNewSize / totalOriginalSize)) * 100).toFixed(1)}%`);
  console.log('----------------------------------------------------');
  
  console.log('Substituindo pasta original pela pasta otimizada...');
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      fs.unlinkSync(path.join(inputDir, file));
    }
  }
  
  const optimizedFiles = fs.readdirSync(outputDir);
  for (const optFile of optimizedFiles) {
    fs.renameSync(path.join(outputDir, optFile), path.join(inputDir, optFile));
  }
  
  fs.rmdirSync(outputDir);
  console.log('Finalizado com sucesso!');
}

optimizeImages();
