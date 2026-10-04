function registerEmptyPages(hexo) {
  hexo.extend.generator.register('empty-blog-pages', function(locals) {
    if (locals.posts.length) return [];
    const data = { posts: locals.posts, total: 0, current: 1 };
    return [
      { path: 'index.html', layout: 'index', data: { ...data, __index: true } },
      { path: 'archives/index.html', layout: 'archive', data: { ...data, archive: true } },
    ];
  });
}
module.exports = { registerEmptyPages };
