# 文章与 HTML 管理

用户通过自然语言指示 Codex 管理内容。所有内容只编辑 main 分支的源文件。

## 普通文章

Markdown 或 HTML 片段保存在 content/_posts。草稿保存在 content/_drafts。

```yaml
---
title: 文章标题
date: 2026-10-04 12:00:00
updated: 2026-10-04 12:00:00
permalink: posts/article-slug/
categories: [GPU 编程]
tags: [CUDA]
description: 一句话摘要
---
```

正文中 `<!-- more -->` 前是首页摘要。改标题和正文时保留 permalink 和发布日期。

## 完整 HTML

`npm run import-html -- 文件路径 slug "标题"` 自动识别完整 HTML 文档或正文片段。

- 正文片段创建 .html 文章，沿用博客主题。
- 完整文档保存在 content/interactive，原样保留样式和脚本，同时创建用于管理摘要、标题和分类的元数据文章；默认 `display: full-html`，文章地址直接展示完整文档，不需要再点击跳转。
- 默认草稿；传入 --publish 只建立正式文章，仍需检查、提交和发布。

完整 HTML 的文章头部包含 `interactive: slug.html`。生产构建只复制正式、已到发布日期的文章引用的 HTML；撤下文章后，未被其他正式文章引用的 HTML 也会从发布包移除。共享页面可被多篇文章引用。

CUDA 文章地址 `/posts/cuda-sm-warp-occupancy/` 直接展示交互文档；旧地址 `/cuda-sm-warp-occupancy.html` 继续保留。完整文档使用自己的样式和脚本，首页和文章列表继续使用博客主题。

所有新导入文章都应检查正文、补充摘要/分类/标签并预览。HTML 如引用额外图片或样式，明确放入 assets 中并核对链接；assets 的内容公开，不放私密草稿和凭据。

## 生命周期

- 新增：默认草稿。
- 发布：移入 _posts 后生成、检查并发布。
- 修改：只改源文件，更新时间不改地址。
- 撤下：移入 _drafts，重新生成完整网站和所有列表。
- 草稿预览：npm run preview-drafts；正式预览：npm run build、check、preview。
- 分类与标签变更：修改数组，生成过程同步列表并清除旧生成页面。

没有新增后台或定时发布；执行时间以用户授权和 Codex 当前任务为准。
