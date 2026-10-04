const fs = require('node:fs');
const path = require('node:path');
function files(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not supported: ${file}`);
    return entry.isDirectory() ? files(file, base) : [path.relative(base, file).split(path.sep).join('/')];
  }).sort();
}
function safePath(value) {
  if (typeof value !== 'string' || !value || value.startsWith('/') || /[\\?#\0]/.test(value) || value.split('/').some(part => part === '..' || part === '.')) {
    throw new Error(`Unsafe site path: ${value}`);
  }
  return value;
}
function xml(value) {
  return String(value).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
}
module.exports = { files, safePath, xml };
