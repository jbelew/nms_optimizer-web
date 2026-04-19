import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const IGNORE_FILES = ['EasterEggCoordinates.tsx', 'LoremIpsumSkeleton.tsx'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'storybook-static'];
const SRC_DIR = 'src';

// Regex for JSX text content: >Some Text<
const JSX_TEXT_REGEX = />([^<>{}\n\r]+)</g;
const UNIVERSAL_STRINGS = ["NO MAN'S SKY"];
// Regex for attributes: label="Some Text", title="Some Text", etc.
const ATTR_TEXT_REGEX = /(label|title|placeholder|description|aria-label)="([^"{}\n\r]*[a-zA-Z]{2,}[^"{}\n\r]*)"/g;

function getFiles(dir) {
  const files = readdirSync(dir);
  let allFiles = [];
  for (const file of files) {
    const path = join(dir, file);
    if (IGNORE_DIRS.includes(file)) continue;
    if (statSync(path).isDirectory()) {
      allFiles = allFiles.concat(getFiles(path));
    } else if (extname(file) === '.tsx' && !IGNORE_FILES.includes(basename(file))) {
      allFiles.push(path);
    }
  }
  return allFiles;
}

function auditFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const results = [];

  let match;
  while ((match = JSX_TEXT_REGEX.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1 && !/^[0-9\s.,!?-]+$/.test(text) && !UNIVERSAL_STRINGS.includes(text)) {
      results.push({ line: getLineNumber(content, match.index), text, type: 'JSX Text' });
    }
  }

  while ((match = ATTR_TEXT_REGEX.exec(content)) !== null) {
    const attr = match[1];
    const text = match[2].trim();
    if (text && !text.includes('t(')) {
       results.push({ line: getLineNumber(content, match.index), text: `${attr}="${text}"`, type: 'Attribute' });
    }
  }

  return results;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

const files = getFiles(SRC_DIR);
console.log(`Auditing ${files.length} files...`);

const allResults = {};
files.forEach(file => {
  const results = auditFile(file);
  if (results.length > 0) {
    allResults[file] = results;
  }
});

Object.entries(allResults).forEach(([file, results]) => {
  console.log(`\nFile: ${file}`);
  results.forEach(res => {
    console.log(`  [Line ${res.line}] (${res.type}): ${res.text}`);
  });
});
