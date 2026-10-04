const { xml } = require('./files.cjs');
function indexes(posts, site, title) {
  const url = path => new URL(path.replace(/^\/+/, ''), site).href;
  const index = posts.map(post => ({
    title: post.title, path: post.path.replace(/^\/+/, ''), published: post.published !== false,
    date: post.date.format('YYYY-MM-DD'), source: post.source,
    categories: post.categories.map(item => ({ name: item.name, path: item.path })),
    tags: post.tags.map(item => ({ name: item.name, path: item.path })),
  }));
  const search = '<?xml version="1.0" encoding="UTF-8"?><search>' + posts.map(post =>
    `<entry><title>${xml(post.title)}</title><content>${xml(post.content.replace(/<[^>]*>/g, ' '))}</content><url>/${xml(post.path.replace(/^\/+/, ''))}</url></entry>`
  ).join('') + '</search>';
  const updated = new Date(posts.length ? Math.max(...posts.map(post => post.updated.valueOf())) : 0).toISOString();
  const atom = '<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom">' +
    `<title>${xml(title)}</title><id>${xml(site)}</id><link href="${xml(site)}"/><link href="${xml(url('atom.xml'))}" rel="self"/><updated>${updated}</updated>` +
    posts.map(post => `<entry><title>${xml(post.title)}</title><id>${xml(url(post.path.replace(/index.html$/, '')))}</id><link href="${xml(url(post.path.replace(/index.html$/, '')))}"/><updated>${post.updated.toISOString()}</updated><published>${post.date.toISOString()}</published><author><name>GOGOYAO</name></author><content type="html">${xml(post.content)}</content></entry>`).join('') + '</feed>';
  return { 'blog-index.json': JSON.stringify(index, null, 2) + '\n', 'search.xml': search, 'atom.xml': atom };
}
module.exports = { indexes };
