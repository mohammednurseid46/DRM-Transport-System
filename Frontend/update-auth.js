const fs = require('fs');
const path = require('path');

const srcDirectory = path.join(__dirname, 'src');

const colorReplacements = [
  { search: /bg-dms-bg/g, replace: 'bg-slate-50 dark:bg-slate-900' },
  { search: /bg-dms-card/g, replace: 'bg-white dark:bg-slate-800 shadow-sm' },
  { search: /bg-dms-elevated/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { search: /border-white\/5/g, replace: 'border-slate-200 dark:border-slate-700' },
  { search: /border-white\/10/g, replace: 'border-slate-200 dark:border-slate-700' },
  { search: /text-gray-400/g, replace: 'text-slate-600 dark:text-slate-400' },
  { search: /text-gray-500/g, replace: 'text-slate-500 dark:text-slate-500' },
  { search: /text-gray-300/g, replace: 'text-slate-700 dark:text-slate-300' },
  { search: /text-gray-200/g, replace: 'text-slate-800 dark:text-slate-200' },
  { search: /text-white/g, replace: 'text-slate-900 dark:text-white' },
  { search: /text-dms-primary/g, replace: 'text-orange-600 dark:text-orange-500' },
  { search: /bg-dms-primary/g, replace: 'bg-orange-500 dark:bg-orange-600' },
  { search: /bg-dms-primary-hover/g, replace: 'bg-orange-600 dark:bg-orange-500' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace legacy color classes
  colorReplacements.forEach(({ search, replace }) => {
    content = content.replace(search, replace);
  });

  // 2. Detect authentication pages and inject ThemeToggle
  const isAuthPage = filePath.includes(path.join('src', 'app', '(auth)')) && filePath.endsWith('page.tsx');
  
  if (isAuthPage && !content.includes('ThemeToggle')) {
    content = content.replace(
      /import {.*?} from "lucide-react";/, 
      match => match + '\nimport { ThemeToggle } from "@/components/ThemeToggle";'
    );
    
    content = content.replace(
      /<Link href="\/" className="flex items-center gap-2">\n\s*<div className="flex h-8/,
      '<div className="flex items-center gap-4">\n          <ThemeToggle />\n        <Link href="/" className="flex items-center gap-2">\n          <div className="flex h-8'
    );
    
    content = content.replace(
      /<span className="font-bold text-slate-900 dark:text-slate-900 dark:text-white hidden sm:block tracking-tight">Dream More<\/span>\n\s*<\/Link>\n\s*<\/div>/,
      '<span className="font-bold text-slate-900 dark:text-slate-900 dark:text-white hidden sm:block tracking-tight">Dream More</span>\n        </Link>\n        </div>\n      </div>'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

console.log("Starting unified refactor script...");
walkDir(srcDirectory);
console.log("Refactoring complete.");
