const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const { root, assets, interactive, publicDir, buildManifest } = require('./lib/paths.cjs');
const { files, safePath } = require('./lib/files.cjs');
const { validateArticles } = require('./lib/articles.cjs');
const { indexes } = require('./lib/indexes.cjs');
const { registerEmptyPages } = require('./lib/routes.cjs');
async function build({ drafts = false } = {}) {
  validateArticles({ drafts });
  const hexo = new Hexo(root, { silent: true, draft: drafts });
  registerEmptyPages(hexo);
  await hexo.init();
  try {
    await hexo.call('clean');
    for (const file of files(assets)) {
      const dest = path.join(publicDir, safePath(file));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(assets, file), dest);
    }
    await hexo.call('generate');
    const posts = hexo.locals.get('posts').sort('date', -1).toArray()
      .filter(post => (drafts || post.published !== false) && post.date.valueOf() <= Date.now());
    if (new Set(posts.map(post => post.path)).size !== posts.length) throw new Error('Duplicate generated article URLs');
    const interactiveFiles = [...new Set(posts.flatMap(post => post.interactive ? [post.interactive].flat() : []))].sort();
    for (const file of interactiveFiles) {
      safePath(file);
      const dest = path.join(publicDir, file);
      if (fs.existsSync(dest)) throw new Error(`Interactive page collides with generated/asset file: ${file}`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(interactive, file), dest);
    }
    const fullHTML = posts.filter(post => post.display === 'full-html').map(post => {
      if (typeof post.interactive !== 'string') throw new Error(`Full HTML article needs one interactive document: ${post.path}`);
      const articlePath = post.path.replace(/^\/+/, '');
      const articleFile = safePath(articlePath.endsWith('/') ? articlePath + 'index.html' : articlePath);
      fs.copyFileSync(path.join(interactive, safePath(post.interactive)), path.join(publicDir, articleFile));
      return { source: post.interactive, route: articleFile };
    });
    fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');
    for (const [name, content] of Object.entries(indexes(posts, hexo.config.url + '/', hexo.config.title))) {
      fs.writeFileSync(path.join(publicDir, name), content);
    }
    const routes = files(publicDir);
    fs.writeFileSync(buildManifest, JSON.stringify({ mode: drafts ? 'drafts' : 'production', routes, interactive: interactiveFiles, fullHTML }, null, 2) + '\n');
    console.log(`Built ${posts.length} ${drafts ? 'preview' : 'published'} articles.`);
    return { posts, routes };
  } finally { await hexo.exit(); }
}
module.exports = { build };
if (require.main === module) build({ drafts: process.argv.includes('--drafts') }).catch(error => { console.error(error.message); process.exitCode = 1; });
