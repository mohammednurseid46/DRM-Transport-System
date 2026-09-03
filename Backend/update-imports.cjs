const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const newContent = content.replace(/from\s+['"](\.\.?\/[^'"]+)['"]/g, (match, p1) => {
        if (p1.endsWith('.js') || p1.endsWith('.ts')) return match;
        return `from '${p1}.js'`;
      });
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

walkDir('src');
