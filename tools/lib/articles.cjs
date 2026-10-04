const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { content } = require('./paths.cjs');
const { files, safePath } = require('./files.cjs');
function articles({ drafts = false } = {}) {
  const posts = [];
  for (const entry of fs.readdirSync(content, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) throw new Error(`content/${entry.name}: use one english-slug folder per article`);
    const dir = path.join(content, entry.name);
    const meta = path.join(dir, 'meta.md');
    if (!fs.existsSync(meta)) throw new Error(`${entry.name}: missing meta.md`);
    const { data, content: summary } = matter(fs.readFileSync(meta, 'utf8'));
    const fail = reason => { throw new Error(`${entry.name}: ${reason}`); };
    if (typeof data.title !== 'string' || !data.title.trim()) fail('missing title');
    if (!data.date || Number.isNaN(new Date(data.date).valueOf())) fail('invalid date');
    if (!['draft', 'published'].includes(data.status)) fail('status must be draft or published');
    for (const key of ['categories', 'tags']) if (!Array.isArray(data[key]) || data[key].some(value => typeof value !== 'string' || !value.trim())) fail(`${key} must be an array of names`);
    const documents = ['content.md', 'content.html'].filter(file => fs.existsSync(path.join(dir, file)));
    if (documents.length !== 1) fail('provide exactly one content.md or content.html');
    const file = documents[0], body = fs.readFileSync(path.join(dir, file), 'utf8');
    if (!body.trim()) fail('empty content document');
    const permalink = safePath(data.permalink || `posts/${entry.name}/`);
    if (!permalink.endsWith('/')) fail('permalink must end with /');
    const aliases = data.aliases || [];
    if (!Array.isArray(aliases)) fail('aliases must be an array');
    aliases.forEach(safePath);
    const attachments = files(dir).filter(item => !['meta.md', file].includes(item));
    const draft = data.status === 'draft';
    if (draft && !drafts) continue;
    posts.push({ ...data, slug: entry.name, dir, source: `${entry.name}/${file}`, file, body, summary: summary.trim(), draft, permalink, aliases, attachments, fullHTML: file.endsWith('.html') && /<!doctype\s+html|<(html|head|body)(\s|>)/i.test(body) });
  }
  return posts;
}
function validateArticles(options) {
  const posts = articles(options), urls = new Set();
  for (const post of posts) for (const route of [post.permalink + 'index.html', ...post.aliases.map(alias => alias.endsWith('/') ? alias + 'index.html' : alias)]) {
    if (urls.has(route)) throw new Error(`Duplicate article URL: ${route}`);
    urls.add(route);
  }
  return posts;
}
module.exports = { articles, validateArticles };
