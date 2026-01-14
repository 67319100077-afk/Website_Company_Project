// Simple script to inject footer partial + CSS/JS into HTML files
// Usage: node tools/insert-footer.js index.html products.html news/*.html
// Requirements: Node.js

const fs = require('fs');
const path = require('path');

const FOOTER_PARTIAL = path.join(__dirname, '..', 'partials', 'footer.html');
const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node tools/insert-footer.js <file1.html> [file2.html ...]');
  process.exit(1);
}
if (!fs.existsSync(FOOTER_PARTIAL)) {
  console.error('partials/footer.html not found. Create it and paste footer markup there.');
  process.exit(2);
}
const footerHtml = fs.readFileSync(FOOTER_PARTIAL, 'utf8').trim();

// Defaults: use root-relative resources (adjust if needed)
const cssLinkTag = '<link rel="stylesheet" href="/css/footer.css">';
const scriptTag = '<script src="/js/footer.js"></script>';

// Helper to insert into head (if not present) and before </body>
function processFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.warn('Skip (not found):', filePath);
    return;
  }
  let html = fs.readFileSync(abs, 'utf8');

  // Ensure <head> exists
  const headClose = '</head>';
  if (html.includes(headClose)) {
    if (!html.includes(cssLinkTag)) {
      html = html.replace(headClose, '  ' + cssLinkTag + '\n' + headClose);
      console.log(`Inserted CSS link into <head> of ${filePath}`);
    } else {
      console.log(`CSS link already present in ${filePath}`);
    }
  } else {
    console.warn(`<head> not found in ${filePath}, skipping head insert.`);
  }

  // Insert footer before </body> if not present
  const bodyClose = '</body>';
  if (html.includes(bodyClose)) {
    if (!html.includes('<footer') && !html.includes('id="backToTop"')) {
      html = html.replace(bodyClose, footerHtml + '\n' + '  ' + scriptTag + '\n' + bodyClose);
      console.log(`Inserted footer + script into ${filePath}`);
    } else {
      // if footer exists, ensure script tag present
      if (!html.includes(scriptTag)) {
        html = html.replace(bodyClose, '  ' + scriptTag + '\n' + bodyClose);
        console.log(`Inserted script into ${filePath} (footer already present)`);
      } else {
        console.log(`Footer and script already present in ${filePath}`);
      }
    }
  } else {
    console.warn(`</body> not found in ${filePath}, skipping body insert.`);
  }

  fs.writeFileSync(abs, html, 'utf8');
}

// Expand globs (simple)
const glob = require('glob');
const files = args.flatMap(pattern => glob.sync(pattern));

files.forEach(processFile);
console.log('Done.');