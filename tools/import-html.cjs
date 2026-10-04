const fs = require('node:fs');
const path = require('node:path');
const { articleMetadata, writeArticle } = require('./lib/writing.cjs');
const { interactive } = require('./lib/paths.cjs');
function importHTML(file, slug, title, { published = false } = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || !title) throw new Error('Usage: npm run import-html -- file.html english-slug "标题" [--publish]');
  const body = fs.readFileSync(file, 'utf8');
  const fullDocument = /<!doctype\s+html|<(html|head|body)(\s|>)/i.test(body);
  const metadata = articleMetadata(slug, title);
  let text = body;
  if (fullDocument) {
    const filename = slug + '.html';
    const target = path.join(interactive, filename);
    if (fs.existsSync(target)) throw new Error(`Interactive file exists: ${filename}`);
    fs.mkdirSync(interactive, { recursive: true });
    fs.copyFileSync(file, target);
    metadata.interactive = filename;
    metadata.display = 'full-html';
    text = `${title}的完整 HTML 文章。\n\n<!-- more -->\n`;
  }
  return writeArticle(slug, metadata, text, { published, extension: fullDocument ? '.md' : '.html' });
}
module.exports = { importHTML };
if (require.main === module) {
  const [file, slug, title, ...options] = process.argv.slice(2);
  try { console.log(importHTML(file, slug, title, { published: options.includes('--publish') })); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
