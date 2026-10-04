# GOGO 博客

网站：https://gogoyao.github.io/

只维护 `main` 一个分支。修改文章并提交后，GitHub Actions 自动生成、检查和发布网站；生成网页不提交到仓库。

告诉 Codex：“把这个 HTML 发布成文章”“先存草稿”“修改这篇文章”或“撤下文章”，无需管理分支或发布目录。

| 目录 | 用途 |
| --- | --- |
| `content/_posts/` | 正式文章 |
| `content/_drafts/` | 草稿，自动排除上线 |
| `content/interactive/` | 完整 HTML 原稿，直接作为文章展示 |
| `assets/` | 公开图片、样式和脚本 |
| `themes/ayer/` | 博客模板 |
| `tools/` | 写作、预览和检查工具 |

本地使用 Node.js 22，首次运行 `npm ci`。

```sh
npm run new -- article-slug "文章标题"
npm run import-html -- /path/page.html article-slug "文章标题"
npm run list
npm run preview-drafts
```

正式预览：`npm run publish` 后执行 `npm run preview`。这个本地命令只生成并检查，不推送；真正上线由提交到 main 后的自动流程完成。

[文章管理](docs/content.md) · [发布说明](docs/publishing.md)
