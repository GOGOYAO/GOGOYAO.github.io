# GOGO 博客：由 Codex 管理

网站：https://gogoyao.github.io/

你只需要告诉 Codex要写、修改、预览、发布或撤下哪篇文章。打开仓库后，Codex 会按 [AGENTS.md](AGENTS.md) 执行统一流程。

- “写一篇关于……的文章，先存草稿。”
- “把这个 HTML 发布成文章，分类是 GPU 编程。”
- “修改 CUDA 文章，保留地址，然后发布。”
- “撤下这篇文章，保留为草稿。”

## 清晰的内容来源

| 目录 | 用途 |
| --- | --- |
| `content/_posts/` | 正式文章，支持 Markdown 和 HTML 正文 |
| `content/_drafts/` | 可预览的草稿，生产构建排除 |
| `content/interactive/` | 完整独立 HTML，由文章关联后发布 |
| `assets/` | 样式、脚本、图片、字体等公开素材 |
| `themes/ayer/` | 页面模板 |
| `tools/` | 内容管理、生成、检查和发布准备 |
| `tests/` | 流程验证 |
| `docs/` | 详细管理与部署说明 |

`source` 分支仅保存这些源文件；`main` 仅保存发布网页。Codex 自动处理两者，用户无需手工切换分支。生成结果放在忽略的 `public/`，完整发布包放在忽略的 `.publish/`。

## Codex 的统一入口

使用 Node.js 20.19 或更高版本，在仓库根目录执行：

```sh
npm ci
npm run list
npm run new -- article-slug "文章标题"
npm run import-html -- /path/page.html article-slug "文章标题"
npm run preview-drafts
```

正式文章预览：

```sh
npm run build
npm run check
npm run preview
```

获得发布授权后，提交 source，再执行：

```sh
npm run prepare-publish
```

发布完整 .publish 文件树到 main，等待 Pages 部署并验证。prepare-publish 自动重建生产版本，拒绝未提交的源码，并记录 source 提交；它不会自行推送。`npm test` 验证流程变更。

[文章与 HTML 管理指南](docs/content.md) · [发布与回滚](docs/publishing.md)

旧文章、现有主题外观和链接继续沿用；原博客缺少源码时恢复的旧文章仍保留 HTML 正文，后续无需强制转换。
