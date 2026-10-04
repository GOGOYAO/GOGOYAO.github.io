# 使用 Codex 管理 GOGO 博客

日常只需要向 Codex 说明要处理的文章和是否发布。

- “写一篇关于……的文章，先存草稿。”
- “把这篇草稿发布，分类是 GPU 编程，标签是 CUDA。”
- “修改 CUDA 文章的某一段，保留地址，然后发布。”
- “更新 CUDA 交互页，同步文章里的示例，并发布。”
- “把这篇文章撤下，保留源文件作草稿。”
- “列出当前文章和草稿。”

Codex 的执行规范位于仓库根目录 `AGENTS.md`。文章源文件与生成结果一起版本管理；网站继续由 `main` 发布。用 Codex 打开这个仓库后，每次都会读取这些规则，不依赖先前对话记忆。

## 内容位置

| 内容 | 位置 |
| --- | --- |
| 正式文章 | `source/_posts/` |
| 草稿 | `source/_drafts/` |
| 独立交互页 | `source/cuda-sm-warp-occupancy.html` 等 |
| 文章模板 | `scaffolds/post.md` |
| 博客配置 | `_config.yml` |
| 页面模板 | `themes/ayer-restored/layout/` |
| 发布工具 | `tools/` |

文章包含标题、发布日期、固定地址、分类、标签、摘要和正文。后续修改只更新正文与更新时间，不改变地址。

## Codex 使用的命令

使用 Node.js 20.19 或更高版本，在 `_blog` 目录执行：

```sh
npm ci
npm run list
npm run new -- article-slug "文章标题"
npm run preview-drafts
```

生产预览与发布准备：

```sh
npm run build
npm run check
npm run preview
npm run prepare-publish
```

预览地址默认为 `http://127.0.0.1:4173`。发布准备完成后，Codex 审阅差异、提交并推送 `main`，等待 Pages 部署并验证线上链接。`prepare-publish` 始终重新生成生产版本，排除草稿，即使前一步预览过草稿。

`check` 会检查首页最新文章、归档、分类和标签、搜索、站内链接、草稿隔离，以及独立交互 HTML 原样保留。页面外观与交互还需要浏览器验证。

生成文件清单让撤稿、改分类和改标签后的旧页面自动清除，清单以外的文件不删除。

## 本次恢复

原仓库只保存了生成后的网页。此次使用 Hexo 建立源项目，旧文章正文从已发布 HTML 原样恢复，主题模板根据现有 Ayer 页面结构恢复，沿用现有静态资源和旧文章链接。这是可维护的兼容模板，不是找回的原始主题源码。

CUDA 文章地址为 `/posts/cuda-sm-warp-occupancy/`，独立示意图地址继续为 `/cuda-sm-warp-occupancy.html`。
