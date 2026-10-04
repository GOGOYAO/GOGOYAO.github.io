const { articleMetadata, writeArticle } = require('./lib/writing.cjs');
const [slug, title, ...options] = process.argv.slice(2);
try {
  const metadata = articleMetadata(slug, title);
  console.log(writeArticle(slug, metadata, '文章摘要。\n\n<!-- more -->\n\n正文。\n', { published: options.includes('--publish') }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
