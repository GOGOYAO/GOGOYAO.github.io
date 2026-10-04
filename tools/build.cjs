const fs = require('node:fs');
const path = require('node:path');
const Hexo = require('hexo');
const matter = require('gray-matter');
const { articlePage } = require('./lib/article-page.cjs');
const cheerio = require('cheerio');
const { root, assets, content, generated, pages, publicDir, buildManifest } = require('./lib/paths.cjs');
const { files, safePath } = require('./lib/files.cjs');
const { validateArticles } = require('./lib/articles.cjs');
const { indexes } = require('./lib/indexes.cjs');
const { registerEmptyPages } = require('./lib/routes.cjs');
async function build({ drafts = false } = {}) {
  const documents = validateArticles({ drafts });
  fs.rmSync(generated, { recursive: true, force: true });
  fs.mkdirSync(generated, { recursive: true });
  for (const file of files(pages)) {
    const destination = path.join(generated, path.basename(file, '.md'), 'index.md');
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(pages, file), destination);
  }
  for (const post of documents) {
    const { title, date, updated, categories, tags, permalink, summary, slug, draft, body, file, fullHTML } = post;
    let renderedBody = body;
    if (fullHTML) {
      const $ = cheerio.load(body); $('script,style').remove();
      renderedBody = $('body').html() || summary;
    }
    const metadata = { title, date, updated: updated || date, categories, tags, permalink, article_summary: summary, article_slug: slug, layout: 'post' };
    const destination = path.join(generated, draft ? '_drafts' : '_posts', slug + path.extname(file));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, matter.stringify(renderedBody, metadata));
  }
  const hexo = new Hexo(root, { silent: true, draft: drafts });
  registerEmptyPages(hexo);
  hexo.extend.filter.register('after_post_render', data => {
    if (data.article_summary) data.excerpt = hexo.render.renderSync({ text: data.article_summary, engine: 'md' });
    const article = documents.find(post => post.slug === data.article_slug);
    if (article) for (const key of ['content', 'excerpt']) {
      const $ = cheerio.load(data[key] || '', null, false);
      let changed = false;
      $('a[href],img[src],script[src],link[href]').each((_, element) => {
        const attribute = $(element).attr('href') !== undefined ? 'href' : 'src';
        const value = $(element).attr(attribute);
        if (!value || /^(\/|#|[a-z][a-z0-9+.-]*:)/i.test(value)) return;
        const url = new URL(value, hexo.config.url + '/' + article.permalink);
        $(element).attr(attribute, url.pathname + url.search + url.hash); changed = true;
      });
      if (changed) data[key] = $.html();
    }
    return data;
  });
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
    const copied = [], fullPages = [];
    const publishedDocuments = posts.map(post => {
      const document = documents.find(item => item.slug === post.article_slug);
      if (document) post.source = document.source;
      return document;
    });
    const writeCopy = (source, route, replace = false) => {
      const destination = path.join(publicDir, safePath(route));
      if (!replace && fs.existsSync(destination)) throw new Error(`Article resource collides with generated route: ${route}`);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(content, source), destination);
      copied.push({ source, route });
    };
    for (const post of publishedDocuments) {
      if (!post) throw new Error('Generated article has no content document');
      const route = post.permalink + 'index.html';
      if (post.fullHTML) {
        const rendered = posts.find(item => item.article_slug === post.slug);
        const summary = post.summary ? rendered.excerpt : '';
        fs.writeFileSync(path.join(publicDir, route), articlePage(post.body, post.title, summary));
        fullPages.push({ source: post.source, route, title: post.title, summary });
      }
      for (const file of post.attachments) writeCopy(post.slug + '/' + file, post.permalink + file);
      for (const alias of post.aliases) {
        const aliasRoute = alias.endsWith('/') ? alias + 'index.html' : alias;
        const destination = path.join(publicDir, aliasRoute);
        if (fs.existsSync(destination)) throw new Error(`Alias collides with generated route: ${aliasRoute}`);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(path.join(publicDir, route), destination);
        if (post.fullHTML) fullPages.push({ ...fullPages.find(page => page.route === route), route: aliasRoute });
      }
    }
    fs.writeFileSync(path.join(publicDir, '.nojekyll'), '');
    for (const [name, content] of Object.entries(indexes(posts, hexo.config.url + '/', hexo.config.title))) {
      fs.writeFileSync(path.join(publicDir, name), content);
    }
    let commit = process.env.GITHUB_SHA || null;
    if (!commit) {
      try { commit = require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
    }
    fs.writeFileSync(path.join(publicDir, 'publish.json'), JSON.stringify({ source_branch: 'main', source_commit: commit, site_url: hexo.config.url }, null, 2) + '\n');
    const routes = files(publicDir);
    fs.writeFileSync(buildManifest, JSON.stringify({ mode: drafts ? 'drafts' : 'production', routes, copied, fullPages }, null, 2) + '\n');
    console.log(`Built ${posts.length} ${drafts ? 'preview' : 'published'} articles.`);
    return { posts, routes };
  } finally { await hexo.exit(); }
}
module.exports = { build };
if (require.main === module) build({ drafts: process.argv.includes('--drafts') }).catch(error => { console.error(error.message); process.exitCode = 1; });
