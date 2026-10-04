const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { content } = require('./paths.cjs');
function articleMetadata(slug, title) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || !title?.trim()) throw new Error('Provide an english-slug and a non-empty title.');
  for (const folder of ['_posts', '_drafts']) for (const extension of ['.md', '.html']) {
    if (fs.existsSync(path.join(content, folder, slug + extension))) throw new Error(`Article exists: ${slug}`);
  }
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  return { title, date, updated: date, permalink: `posts/${slug}/`, categories: [], tags: [], description: '' };
}
function writeArticle(slug, metadata, body, { published = false, extension = '.md' } = {}) {
  const destination = path.join(content, published ? '_posts' : '_drafts', slug + extension);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, matter.stringify(body, metadata), { flag: 'wx' });
  return destination;
}
module.exports = { articleMetadata, writeArticle };
