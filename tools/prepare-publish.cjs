const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { root, publicDir } = require('./lib/paths.cjs');
const { files } = require('./lib/files.cjs');
const { build } = require('./build.cjs');
const { check } = require('./check.cjs');
async function preparePublish() {
  const git = (...args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  if (git('branch', '--show-current') !== 'source') throw new Error('Publish from the source branch.');
  if (git('status', '--porcelain')) throw new Error('Commit source changes before preparing a release.');
  const commit = git('rev-parse', 'HEAD');
  await build();
  check();
  const destination = path.join(root, '.publish');
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(publicDir, destination, { recursive: true });
  fs.rmSync(path.join(destination, '.build.json'));
  for (const [from, to] of [['deployment-readme.md', 'README.md'], ['deployment-agents.md', 'AGENTS.md']]) {
    fs.copyFileSync(path.join(root, 'docs', from), path.join(destination, to));
  }
  const output = files(destination);
  fs.writeFileSync(path.join(destination, 'publish.json'), JSON.stringify({ source_branch: 'source', source_commit: commit, site_url: 'https://gogoyao.github.io/', files: output }, null, 2) + '\n');
  console.log(`Release prepared in .publish/ from source commit ${commit}. Publish its complete file tree to main.`);
}
module.exports = { preparePublish };
if (require.main === module) preparePublish().catch(error => { console.error(error.message); process.exitCode = 1; });
