const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), cp = require('node:child_process');
const source = path.resolve(__dirname, '..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'gogo-content-test-'));
for (const name of ['tools', 'content', 'pages', 'themes', 'assets', '_config.yml', 'package.json']) fs.cpSync(path.join(source, name), path.join(fixture, name), { recursive: true });
fs.symlinkSync(path.join(source, 'node_modules'), path.join(fixture, 'node_modules'), 'dir');
const run = (tool, ...args) => cp.execFileSync(process.execPath, [path.join(fixture, 'tools', tool + '.cjs'), ...args], { cwd: fixture, encoding: 'utf8', stdio: 'pipe' });
const output = file => path.join(fixture, 'public', file);
const inventory = () => JSON.parse(fs.readFileSync(output('blog-index.json')));
const meta = slug => path.join(fixture, 'content', slug, 'meta.md');
const status = (slug, value) => fs.writeFileSync(meta(slug), fs.readFileSync(meta(slug), 'utf8').replace(/status: \w+/, 'status: ' + value));
test.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
test('existing URLs and complete CUDA document remain intact', () => {
  run('build'); run('check'); assert.equal(inventory().length, 4);
  const original = fs.readFileSync(path.join(fixture, 'content/cuda-sm-warp-occupancy/content.html'));
  for (const route of ['posts/cuda-sm-warp-occupancy/index.html', 'cuda-sm-warp-occupancy.html']) { const page = fs.readFileSync(output(route), 'utf8'); assert(page.includes('data-blog-summary')); assert(page.includes('交互图把硬件容量')); assert(page.includes(original.toString().match(/<script>[\s\S]*?<\/script>/)[0])); }
  assert(inventory().some(post => post.path === '2021/07/31/博客搭建方法/'));
  assert.equal(JSON.parse(fs.readFileSync(output('publish.json'))).source_branch, 'main');
});
test('manually added Markdown folder publishes with its metadata summary and relative attachments', () => {
  const dir = path.join(fixture, 'content/manual-md'); fs.mkdirSync(dir);
  fs.writeFileSync(meta('manual-md'), '---\ntitle: Manual MD\ndate: 2026-01-01\nstatus: published\ncategories: [QA]\ntags: [Example]\n---\nUnique metadata summary.');
  fs.writeFileSync(path.join(dir, 'content.md'), '# Independent body\n\n![Example](diagram.svg)');
  fs.writeFileSync(path.join(dir, 'diagram.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  run('build'); run('check');
  assert(inventory().some(post => post.path === 'posts/manual-md/'));
  assert(fs.readFileSync(output('index.html'), 'utf8').includes('Unique metadata summary.'));
  assert(fs.readFileSync(output('posts/manual-md/index.html'), 'utf8').includes('Independent body'));
  assert(fs.existsSync(output('posts/manual-md/diagram.svg')));
  status('manual-md', 'draft'); run('build'); run('check');
  assert(!fs.existsSync(output('posts/manual-md'))); assert(!fs.existsSync(output('categories/QA')));
});
test('HTML drafts and attachments preview, publish and withdraw solely through status', () => {
  const file = path.join(fixture, 'input.html'); fs.writeFileSync(file, '<!doctype html><html><body><h1>HTML content</h1><script src="app.js"></script></body></html>');
  run('import', file, 'qa-html', 'QA HTML');
  fs.writeFileSync(path.join(fixture, 'content/qa-html/app.js'), 'window.ready=true;');
  run('build'); assert(!fs.existsSync(output('posts/qa-html')));
  run('build', '--drafts'); run('check', '--drafts');
  assert(fs.readFileSync(output('posts/qa-html/index.html'), 'utf8').includes('<h1>HTML content</h1><script src="app.js"></script>'));
  assert(fs.readFileSync(output('posts/qa-html/index.html'), 'utf8').includes('data-blog-header'));
  assert(fs.existsSync(output('posts/qa-html/app.js')));
  assert.throws(() => run('check'), /Draft preview cannot be published/);
  status('qa-html', 'published'); run('build'); run('check'); assert.equal(inventory().length, 5);
  status('qa-html', 'draft'); run('build'); run('check'); assert.equal(inventory().length, 4); assert(!fs.existsSync(output('posts/qa-html')));
});
test('invalid or ambiguous folders and duplicate routes fail before replacing the last good site', () => {
  const dir = path.join(fixture, 'content/invalid'); fs.mkdirSync(dir);
  const before = fs.readFileSync(output('blog-index.json'));
  assert.throws(() => run('build'), /missing meta.md/);
  fs.writeFileSync(meta('invalid'), '---\ntitle: Invalid\ndate: 2026-01-01\nstatus: published\ncategories: []\ntags: []\n---\n');
  fs.writeFileSync(path.join(dir, 'content.md'), 'body'); fs.writeFileSync(path.join(dir, 'content.html'), 'body');
  assert.throws(() => run('build'), /exactly one/); fs.unlinkSync(path.join(dir, 'content.html'));
  fs.writeFileSync(meta('invalid'), fs.readFileSync(meta('invalid'), 'utf8').replace('status: published', 'status: published\npermalink: posts/cuda-sm-warp-occupancy/'));
  assert.throws(() => run('build'), /Duplicate article URL/);
  assert(fs.readFileSync(output('blog-index.json')).equals(before)); fs.rmSync(dir, { recursive: true });
});
test('an empty blog and HTML fragments use the normal blog layouts', () => {
  const dir = path.join(fixture, 'content'), saved = path.join(fixture, 'saved'); fs.renameSync(dir, saved); fs.mkdirSync(dir);
  try {
    run('build'); run('check'); assert.equal(inventory().length, 0);
    const file = path.join(fixture, 'fragment.html'); fs.writeFileSync(file, '<h2>Fragment body</h2>');
    run('import', file, 'fragment', 'Fragment', '--publish'); run('build'); run('check');
    const page = fs.readFileSync(output('posts/fragment/index.html'), 'utf8'); assert(page.includes('article-title')); assert(page.includes('<h2>Fragment body</h2>'));
  } finally { fs.rmSync(dir, { recursive: true }); fs.renameSync(saved, dir); }
});
