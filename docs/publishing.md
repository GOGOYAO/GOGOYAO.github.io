# 发布与回滚

只维护 main。修改原稿 → 提交 main → 自动构建、检查并发布 GitHub Pages。

网站生成在忽略的 public 目录；自动流程只上传这个目录，不提交生成页面、不创建发布分支。完整 HTML、旧文章和原网址继续保留。

草稿放在 content/_drafts，生产构建不会包含草稿或它关联的 HTML。明确发布时移入 content/_posts；撤稿则移回草稿目录，提交后自动清理线上列表和页面。

发布前运行 npm run publish，并检查必要的页面交互和手机布局。工具流程变更还需 npm test。提交后等待 GitHub Actions 的 Publish blog 流程成功，再验证线上内容。

网站 publish.json 记录对应的 main 提交。回滚时用新的 main 提交恢复相应原稿，自动重新发布；不强制覆盖历史。
