# GOGO 博客

网站：https://gogoyao.github.io/

只维护 main。每篇文章一个文件夹：内容文档加元信息，提交后自动上线。

```text
content/my-article/
  meta.md          # 标题、日期、状态、分类、标签和首页摘要
  content.md       # 或 content.html，保留原文
```

网址默认 /posts/my-article/。Markdown 使用博客主题，完整 HTML 直接展示。草稿只需 status: draft，发布改为 published。

可以直接用 Git 添加上述文件并推送 main；也可以告诉 Codex“把这个文档发布成文章”“先存草稿”或“撤下文章”。

| 目录 | 用途 |
| --- | --- |
| content | 文章，每篇一个文件夹 |
| pages | 关于、分类、标签等固定页面 |
| assets | 公共图片、样式、脚本 |
| themes | 博客模板 |
| tools / tests | 内容管理、生成与验证 |

本地使用 Node.js 22，首次运行 npm ci。

```sh
npm run new -- my-article "文章标题"
npm run import -- /path/page.html my-article "文章标题"
npm run list
npm run preview-drafts
```

new 和 import 默认草稿，也可直接手工添加文件。正式预览运行 npm run publish，再运行 npm run preview；提交 main 后由 GitHub Actions 真正发布。

public 和 .build-content 都是自动生成的临时目录，忽略且不提交，无需维护。

[内容与元信息格式](docs/content.md) · [发布与回滚](docs/publishing.md)
