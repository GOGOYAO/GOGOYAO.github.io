const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const { publicDir, buildManifest, content } = require('./lib/paths.cjs');
const { safePath } = require('./lib/files.cjs');
function check({ production = true } = {}) {
  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
  if (production && manifest.mode !== 'production') throw new Error('Draft preview cannot be published; rebuild production first.');
  const index = JSON.parse(fs.readFileSync(path.join(publicDir, 'blog-index.json'), 'utf8'));
  const failures = [];
  const fail = message => failures.push(message);
  const html = file => cheerio.load(fs.readFileSync(path.join(publicDir, file), 'utf8'));
  const normalize = href => decodeURIComponent(href.split(/[?#]/)[0]).replace(/index\.html$/, '').replace(/\/$/, '');
  const hrefs = file => { const $ = html(file); return $('a[href]').map((_, el) => normalize($(el).attr('href'))).get(); };
  const home = html('index.html');
  const archiveFiles = manifest.routes.filter(file => /^archives\/.*index\.html$/.test(file));
  const archived = new Set(archiveFiles.flatMap(hrefs));
  for (const post of index) {
    safePath(post.path);
    const articleFile = post.path.endsWith('/') ? post.path + 'index.html' : post.path;
    if (!fs.existsSync(path.join(publicDir, articleFile))) fail(`Article missing: ${post.path}`);
    if (!archived.has(normalize('/' + post.path))) fail(`Archive entry missing: ${post.title}`);
    for (const taxonomy of [...post.categories, ...post.tags]) {
      const file = taxonomy.path.replace(/\/$/, '') + '/index.html';
      if (!fs.existsSync(path.join(publicDir, file))) fail(`Taxonomy missing: ${taxonomy.path}`);
      else if (!hrefs(file).includes(normalize('/' + post.path))) fail(`Taxonomy entry missing: ${post.title}`);
    }
    if (production && !post.published) fail(`Draft included in production: ${post.title}`);
  }
  if (index.length && home('.article-title').first().text().trim() !== index[0].title) fail('Newest article is not first on homepage');
  for (const file of manifest.routes.filter(file => file.endsWith('.html'))) {
    const $ = html(file);
    $('a[href],img[src],script[src],link[href],iframe[src]').each((_, el) => {
      const link = $(el).attr('href') || $(el).attr('src');
      if (!link || /^(https?:|\/\/|#|mailto:|javascript:|data:|tel:)/.test(link)) return;
      let pathname;
      try { pathname = decodeURIComponent(new URL(link, 'https://gogoyao.github.io/' + file).pathname); }
      catch { fail(`Invalid link ${file}: ${link}`); return; }
      if (!fs.existsSync(path.join(publicDir, pathname))) fail(`Broken local link ${file}: ${link}`);
    });
  }
  const search = cheerio.load(fs.readFileSync(path.join(publicDir, 'search.xml'), 'utf8'), { xmlMode: true });
  const searchURLs = new Set(search('entry > url').map((_, el) => normalize(search(el).text())).get());
  for (const post of index) if (!searchURLs.has(normalize('/' + post.path))) fail(`Search entry missing: ${post.title}`);
  for (const page of manifest.copied || []) {
    if (!fs.readFileSync(path.join(content, page.source)).equals(fs.readFileSync(path.join(publicDir, page.route)))) fail(`Article resource changed: ${page.route}`);
  }
  if (failures.length) throw new Error([...new Set(failures)].join('\n'));
  console.log(`Checks passed: ${index.length} articles; home, archives, taxonomies, search, local links and raw HTML.`);
  return index;
}
module.exports = { check };
if (require.main === module) {
  try { check({ production: !process.argv.includes('--drafts') }); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
