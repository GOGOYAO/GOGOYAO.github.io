const fs = require('node:fs');
const path = require('node:path');
const { writeArticle } = require('./lib/writing.cjs');
function importDocument(file, slug, title, { published = false } = {}) {
  const extension = path.extname(file || '').toLowerCase();
  if (!['.md', '.html'].includes(extension)) throw new Error('Provide a .md or .html content document.');
  return writeArticle(slug, title, fs.readFileSync(file, 'utf8'), { published, extension });
}
module.exports = { importDocument };
if (require.main === module) {
  const [file, slug, title, ...options] = process.argv.slice(2);
  try { console.log(importDocument(file, slug, title, { published: options.includes('--publish') })); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
