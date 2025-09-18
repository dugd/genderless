import fs from 'fs';
import path from 'path';

// Конфигурация
const ROOT_DIR = process.cwd();
const OUTPUT_FILE = 'merged.txt';
const EXTENSIONS = ['.ts', '.ejs'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist'];

// Рекурсивный поиск файлов
function findFiles(dir) {
  let files = [];

  fs.readdirSync(dir).forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item)) {
      files = files.concat(findFiles(fullPath));
    } else if (stat.isFile() && EXTENSIONS.includes(path.extname(item))) {
      files.push(fullPath);
    }
  });

  return files;
}

// Объединение файлов
function mergeFiles() {
  const files = findFiles(ROOT_DIR).sort();
  let content = `// Объединено ${files.length} файлов\n// ${new Date()}\n\n`;

  files.forEach((file) => {
    const relativePath = path.relative(ROOT_DIR, file);
    const fileContent = fs.readFileSync(file, 'utf8');

    content += `\n${'='.repeat(50)}\n`;
    content += `// ${relativePath}\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += fileContent + '\n';
  });

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`✅ Объединено ${files.length} файлов в ${OUTPUT_FILE}`);
}

// Запуск
mergeFiles();
