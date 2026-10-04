const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { content } = require('./paths.cjs');
const { files, safePath } = require('./files.cjs');
function articles({ drafts = false } = {}) {
  return ['_posts', ...(drafts ? ['_drafts'] : [])].flatMap(folder =>
    files(path.join(content, folder)).filter(file => /\.(md|html)$/.test(file)).map(file => {
      const source = `${folder}/${file}`;
      const { data, content: body } = matter(fs.readFileSync(path.join(content, source), 'utf8'));
      if (typeof data.title !== 'string' || !data.title.trim()) throw new Error(`${source}: missing title`);
      if (!data.date || Number.isNaN(new Date(data.date).valueOf())) throw new Error(`${source}: invalid date`);
      safePath(data.permalink);
      if (!data.permalink.endsWith('/')) throw new Error(`${source}: permalink must end with /`);
      if (!Array.isArray(data.tags) || !Array.isArray(data.categories)) throw new Error(`${source}: categories/tags must be arrays`);
      if (!body.trim()) throw new Error(`${source}: empty article`);
      return { source, body, ...data, draft: folder === '_drafts' };
    })
  );
}
function validateArticles(options) {
  const posts = articles(options);
  const urls = new Set();
  for (const post of posts) {
    if (urls.has(post.permalink)) throw new Error(`Duplicate permalink: ${post.permalink}`);
    urls.add(post.permalink);
  }
  return posts;
}
module.exports = { articles, validateArticles };
