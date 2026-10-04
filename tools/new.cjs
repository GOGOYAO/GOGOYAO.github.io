const { writeArticle } = require('./lib/writing.cjs');
const [slug, title, ...options] = process.argv.slice(2);
try { console.log(writeArticle(slug, title, '正文。\n', { published: options.includes('--publish') })); }
catch (error) { console.error(error.message); process.exitCode = 1; }
