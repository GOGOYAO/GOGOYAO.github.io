# GOGO 博客

[打开博客](https://gogoyao.github.io/)

这个仓库保存文章原稿。你可以让 Codex 管理文章，也可以自己添加文件并用 Git 发布。所有修改都在 `main` 分支完成。

## 添加一篇文章

每篇文章使用一个文件夹，里面放两个文件：

```text
content/my-article/
  meta.md          # 文章信息：标题、日期、分类、标签和摘要
  content.md       # 文章正文；也可以换成 content.html
```

`meta.md` 示例：

```markdown
---
title: 我的文章
date: 2026-10-04 12:00:00
status: published
categories: [学习笔记]
tags: [CUDA]
---

这里填写首页和文章列表中显示的摘要。
```

把正文放进 `content.md`，或把完整 HTML 页面保存为 `content.html`。两种内容文件只能选一个。图片等附件也可以放在同一文件夹里。

这篇文章的默认网址是 `https://gogoyao.github.io/posts/my-article/`。文件夹名决定网址，所以修改标题时不要改文件夹名。

- Markdown 和 HTML 正文片段使用博客统一样式。
- 完整 HTML 页面直接显示，保留原有样式和交互功能。
- `status: draft` 表示草稿，不会上线；`status: published` 表示正式文章。

## 发布、修改或撤下文章

准备好文件后，将修改推送到 GitHub：

```sh
git add content/my-article
git commit -m "新增文章"
git push origin main
```

GitHub 收到修改后，会自动检查文件、生成网站并发布。完成后，文章会出现在首页、文章列表、分类、标签和搜索中。自动检查失败时，线上保留上次成功发布的版本。

修改文章：编辑正文或 meta.md，再提交并推送。撤下文章：将 status 改成 draft，再提交并推送。

也可以直接告诉 Codex：“把这个文档发布成文章”“先保存为草稿”或“修改这篇文章”。Codex 会处理文件、检查和发布。

## npm 命令是什么？需要自己运行吗？

npm 是运行这个仓库工具的入口。`npm run 名称` 表示执行仓库里预先定义的某个工具，例如 `npm run list` 用来查看文章列表。

**如果只是手工添加文件后用 Git 发布，或者让 Codex 处理，你不必自己运行这些命令。** GitHub 的自动发布流程会完成必要的生成和检查。

只有想在自己的电脑上预览文章，或使用工具创建文章时，才需要安装 Node.js 22，并在仓库根目录（README.md 所在目录）运行命令。

| 命令 | 做什么 |
| --- | --- |
| `npm ci` | 安装工具所需的依赖。首次使用，或依赖清单变化后运行。 |
| `npm run new -- my-article "文章标题"` | 创建文章文件夹、meta.md 和 content.md，默认保存为草稿。 |
| `npm run import -- /path/article.html my-article "文章标题"` | 将已有 Markdown 或 HTML 文档复制为文章正文，并创建 meta.md，默认保存为草稿。 |
| `npm run list` | 显示正式文章和草稿列表。 |
| `npm run preview-drafts` | 生成包含草稿的本地网站，并启动预览服务。 |
| `npm run build` | 在本地生成正式网站，排除草稿。 |
| `npm run check` | 检查刚生成的网站，例如文章入口、站内链接和资源是否完整。 |
| `npm run publish` | 连续执行 build 和 check，生成并检查正式网站。**这个命令只在本地运行，不会把网站发布到网上。** |
| `npm run preview` | 启动本地预览服务，展示已经生成的网站；不会重新生成。 |
| `npm test` | 验证文章管理和构建工具的流程。主要在修改工具代码时使用。 |

示例命令中的 `my-article` 是文章文件夹名，`/path/article.html` 是你电脑上已有文档的路径，请替换成自己的值。`--` 用来把后面的文件名、标题等参数传给工具。

### 在电脑上预览

第一次使用先运行：

```sh
npm ci
```

要看草稿：

```sh
npm run preview-drafts
```

要看正式网站：

```sh
npm run publish
npm run preview
```

启动后，终端会显示本地网址，用浏览器打开即可。按 Ctrl+C 停止预览。修改文件后，需要重新生成才能看到更新；本地预览不会改变线上博客。

## 其他目录

| 目录 | 用途 |
| --- | --- |
| `content/` | 文章内容、元信息和各篇文章的附件。 |
| `pages/` | 关于、分类、标签等固定页面。 |
| `assets/` | 全站共用的图片、样式和脚本。 |
| `themes/` | 博客页面模板。 |
| `tools/`、`tests/` | 上述命令对应的工具和流程验证。 |
| `public/`、`.build-content/` | 工具自动生成的临时结果，不需要手工修改或提交。 |

[内容与元信息格式](docs/content.md) · [发布与回滚](docs/publishing.md)
