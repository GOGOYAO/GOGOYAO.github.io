const path = require('node:path');
const root = path.resolve(__dirname, '../..');
module.exports = {
  root,
  content: path.join(root, 'content'),
  assets: path.join(root, 'assets'),
  generated: path.join(root, '.build-content'),
  pages: path.join(root, 'pages'),
  publicDir: path.join(root, 'public'),
  buildManifest: path.join(root, 'public/.build.json'),
};
