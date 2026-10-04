# 内容文档与元信息

每篇文章一个文件夹。内容文档原样保存，文章信息单独放在 meta.md。

```text
content/
  my-article/
    meta.md
    content.md          # 或 content.html，两者只能选一个
    diagram.svg         # 可选附件
```

meta.md 示例：

```markdown
---
title: 我的文章
date: 2026-10-04 12:00:00
status: published
categories: [GPU 编程]
tags: [CUDA, GPU]
---

首页显示的文章摘要，支持 Markdown。
```

- title、date、status、categories、tags 必填；没有分类或标签时写 []。
- status 为 draft 时不上线；改成 published 后即可发布。未来日期的文章暂不上线，没有定时任务，到期后需再次提交或手动触发构建。
- 文件夹名使用英文小写短横线，决定默认网址 /posts/my-article/。改标题不改文件夹名，保持网址稳定。
- Markdown 和 HTML 片段使用博客主题；完整 HTML 文档直接作为文章展示，保留样式和脚本，自动识别，无需额外 display 配置。
- 图片、样式、脚本等附件放在文章文件夹中，可使用相对路径；附件跟随文章状态发布或撤下。meta.md 和内容原稿不会作为额外下载文件发布。
- 文章详情页在正文前展示 meta.md 的标题和摘要；完整 HTML 的原稿保持不变，生成页面时补充标题和摘要。摘要只在 meta.md 维护，不需要给内容文档添加文章头部或摘要分隔标记。摘要留空时首页使用正文简短预览。
- updated 可选；修改正文时可填写更新时间。permalink 仅用于兼容旧网址，aliases 可保留旧入口，新文章通常不需要这两项。

## 用 Git 直接发布

准备好上面的文件后：

```sh
git add content/my-article
git commit -m "新增文章"
git push origin main
```

GitHub Actions 自动生成和发布文章，首页、文章列表、分类、标签与搜索同步更新。默认网址为 https://gogoyao.github.io/posts/my-article/ 。

只在本地放文件不会上线；缺失元信息、两个内容文档并存或地址冲突会导致构建失败，保留上次成功发布的网站。

## 用 Codex 管理

直接提供文档并说明标题、分类、标签和是否发布即可。Codex 会创建同样的文件结构。新增默认 draft；撤稿只需将 status 改为 draft，不移动目录。

关于页等固定页面在 pages，主题在 themes，公共素材在 assets，与文章内容分开。
