const { articles } = require('./lib/articles.cjs');
try {
  const all = articles({ drafts: true });
  for (const [draft, label] of [[false, '正式文章'], [true, '草稿']]) {
    const list = all.filter(article => article.draft === draft);
    console.log(`\n${label}（${list.length}）`);
    for (const article of list) console.log(`${article.title}\t${article.permalink}\t${article.source}`);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
