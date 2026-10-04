# 此分支仅承载发布网页

博客的唯一源码位于同一仓库的 `source` 分支。`main` 是 GitHub Pages 发布结果。

用户要求新增、修改、重构或管理文章时：
1. 检查本地未提交变化，不覆盖用户工作。
2. 切换到 `source`，读取该分支的 `AGENTS.md` 和 `README.md`，再修改源码。
3. 在 `source` 完成生成、检查、预览，按用户授权发布；禁止直接修补本分支的 HTML。
4. 发布使用 `source` 生成的 `.publish/` 完整文件树，更新 `main`，等待部署并验证。
5. `publish.json` 记录对应的 source 提交，可据此定位发布版本或回滚。禁止 force push。
