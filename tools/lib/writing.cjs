const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { content } = require('./paths.cjs');
function writeArticle(slug, title, body, { published = false, extension = '.md' } = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || !title?.trim()) throw new Error('Provide an english-slug and a non-empty title.');
  const destination = path.join(content, slug);
  if (fs.existsSync(destination)) throw new Error(`Article exists: ${slug}`);
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  fs.mkdirSync(destination);
  fs.writeFileSync(path.join(destination, 'meta.md'), matter.stringify('文章摘要。\n', { title, date, status: published ? 'published' : 'draft', categories: [], tags: [] }));
  fs.writeFileSync(path.join(destination, 'content' + extension), body);
  return destination;
}
module.exports = { writeArticle };
