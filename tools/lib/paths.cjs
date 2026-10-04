const path = require('node:path');
const root = path.resolve(__dirname, '../..');
module.exports = {
  root,
  content: path.join(root, 'content'),
  assets: path.join(root, 'assets'),
  interactive: path.join(root, 'content/interactive'),
  publicDir: path.join(root, 'public'),
  buildManifest: path.join(root, 'public/.build.json'),
};
