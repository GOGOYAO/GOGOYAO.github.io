const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const source = path.resolve(__dirname, '..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'gogo-blog-test-'));
for (const name of ['tools', 'content', 'themes', 'assets', '_config.yml', 'package.json', '.gitignore', 'docs']) fs.cpSync(path.join(source, name), path.join(fixture, name), { recursive: true });
fs.symlinkSync(path.join(source, 'node_modules'), path.join(fixture, 'node_modules'), 'dir');
const run = (tool, ...args) => cp.execFileSync(process.execPath, [path.join(fixture, 'tools', tool + '.cjs'), ...args], { cwd: fixture, encoding: 'utf8', stdio: 'pipe' });
const output = file => path.join(fixture, 'public', file);
const inventory = () => JSON.parse(fs.readFileSync(output('blog-index.json')));
test.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
test('production preserves article routes, raw HTML and deterministic output', () => {
  run('build'); run('check');
  assert.equal(inventory().length, 4);
  assert(fs.readFileSync(output('cuda-sm-warp-occupancy.html')).equals(fs.readFileSync(path.join(fixture, 'content/interactive/cuda-sm-warp-occupancy.html'))));
  assert(fs.readFileSync(output('posts/cuda-sm-warp-occupancy/index.html')).equals(fs.readFileSync(path.join(fixture, 'content/interactive/cuda-sm-warp-occupancy.html'))));
  const before = fs.readFileSync(output('atom.xml'));
  run('build'); assert(fs.readFileSync(output('atom.xml')).equals(before));
});
test('HTML drafts are previewable and never leak through production, including raw documents', () => {
  const file = path.join(fixture, 'input.html'); fs.writeFileSync(file, '<!doctype html><html><body><h1>private draft</h1></body></html>');
  run('import-html', file, 'qa-full-html', 'QA Full HTML');
  run('build'); assert.equal(inventory().length, 4); assert(!fs.existsSync(output('qa-full-html.html')));
  run('build', '--drafts'); run('check', '--drafts'); assert.equal(inventory().length, 5);
  assert(fs.readFileSync(output('qa-full-html.html')).equals(fs.readFileSync(file)));
  assert(fs.readFileSync(output('posts/qa-full-html/index.html')).equals(fs.readFileSync(file)));
  assert(!fs.readFileSync(output('posts/qa-full-html/index.html'), 'utf8').includes('interactive-link'));
  assert.throws(() => run('check'), /Draft preview cannot be published/);
  run('build'); run('check'); assert(!fs.existsSync(output('qa-full-html.html')));
});
test('publishing and withdrawing regenerate all lists and remove stale article and HTML outputs', () => {
  const draft = path.join(fixture, 'content/_drafts/qa-full-html.md');
  const post = path.join(fixture, 'content/_posts/qa-full-html.md');
  fs.renameSync(draft, post);
  let text = fs.readFileSync(post, 'utf8').replace('categories: []', 'categories: [QA Category]').replace('tags: []', 'tags: [QA Tag]');
  fs.writeFileSync(post, text);
  run('build'); run('check'); assert.equal(inventory().length, 5);
  assert(fs.existsSync(output('categories/QA-Category/index.html')));
  fs.renameSync(post, draft); run('build'); run('check');
  assert.equal(inventory().length, 4); assert(!fs.existsSync(output('posts/qa-full-html/index.html')));
  assert(!fs.existsSync(output('qa-full-html.html'))); assert(!fs.existsSync(output('categories/QA-Category/index.html')));
});
test('HTML fragments become ordinary article bodies without an extra standalone page', () => {
  const file = path.join(fixture, 'fragment.html'); fs.writeFileSync(file, '<h2>HTML body</h2><p>正文保持原样。</p>');
  run('import-html', file, 'qa-fragment', 'QA Fragment', '--publish');
  run('build'); run('check');
  assert(fs.readFileSync(output('posts/qa-fragment/index.html'), 'utf8').includes('<h2>HTML body</h2><p>正文保持原样。</p>'));
  assert(!fs.existsSync(output('qa-fragment.html')));
  fs.unlinkSync(path.join(fixture, 'content/_posts/qa-fragment.html'));
});
test('duplicate article URLs are rejected before replacing the last good build', () => {
  run('build'); const before = fs.readFileSync(output('blog-index.json'));
  const file = path.join(fixture, 'content/_posts/qa-duplicate.md');
  fs.writeFileSync(file, '---\ntitle: Duplicate\ndate: 2020-01-01\npermalink: posts/cuda-sm-warp-occupancy/\ncategories: []\ntags: []\n---\nDuplicate');
  assert.throws(() => run('build'), /Duplicate permalink/);
  assert(fs.readFileSync(output('blog-index.json')).equals(before)); fs.unlinkSync(file);
});
test('an empty blog generates a valid home, archive, indexes and feed', () => {
  const posts = path.join(fixture, 'content/_posts'), saved = path.join(fixture, 'saved-posts');
  fs.renameSync(posts, saved); fs.mkdirSync(posts);
  try { run('build'); run('check'); assert.equal(inventory().length, 0); }
  finally { fs.rmSync(posts, { recursive: true }); fs.renameSync(saved, posts); }
});
test('publish builds only website output with main revision metadata', () => {
  run('build'); run('check');
  const metadata = JSON.parse(fs.readFileSync(output('publish.json')));
  assert.equal(metadata.source_branch, 'main');
  for (const name of ['content', 'node_modules', 'tools', '_blog', 'AGENTS.md']) assert(!fs.existsSync(output(name)));
});
