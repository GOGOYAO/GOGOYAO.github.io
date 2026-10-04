# 发布与回滚

只维护 main。修改原稿 → 提交 main → 自动构建、检查并发布 GitHub Pages。

内容与元信息由工具自动组合成临时 .build-content，再生成网站到忽略的 public 目录；自动流程只上传这个目录，不提交生成页面、不创建发布分支。完整 HTML、旧文章和原网址继续保留。

每篇文章的 meta.md 用 status: draft/published 控制状态。草稿及其附件不会上线；撤稿改为 draft，提交后自动清理线上列表和页面。

发布前运行 npm run publish，并检查必要的页面交互和手机布局。工具流程变更还需 npm test。提交后等待 GitHub Actions 的 Publish blog 流程成功，再验证线上内容。

网站 publish.json 记录对应的 main 提交。回滚时用新的 main 提交恢复相应原稿，自动重新发布；不强制覆盖历史。
