# 发布与回滚

## 维护与发布分离

source 是唯一维护分支。main 是现有 GitHub Pages 的发布分支，继续沿用原来的配置与域名。

public 和 .publish 都是本地生成目录，不提交 source。assets 是源素材，构建不再从 main 的发布结果复制回来。

## 一套发布流程

1. 同步 source 与 main，保护本地修改。
2. 编辑源文件，生成并检查页面，根据变化验证交互、旧链接与手机显示。
3. 提交并推送 source。
4. 在对应的 source 提交执行 npm run prepare-publish。它要求干净的 source 工作区，重新生产构建、检查，生成 .publish。
5. 使用 .publish 的完整文件树提交 main；不要与历史输出叠加。这样撤稿、分类变更不会残留旧页面，也不会把源码或依赖混入发布目录。
6. main 新提交以当前 main 为父，非强制更新。发现并发变化时重新同步；不要 force push。
7. 等待 Pages 部署成功，检查线上首页、文章、资源和关键链接。

Git CLI 不可认证时，Codex 使用已连接的 GitHub 工具执行相同流程，不向用户索取令牌。

.publish 包含 .nojekyll、网站网页/素材、部署分支的简短 README 和 AGENTS，以及 publish.json。publish.json 记录 source 提交，能准确查到上线版本。

## 检查边界

自动检查：文章元数据、重复地址、生产/草稿区分、首页、归档、分类、标签、搜索 URL、站内链接，以及关联 HTML 未被重新渲染。流程测试验证 HTML 导入、草稿 HTML 隔离、撤稿清理、可重复生成和空站点。

外观和业务交互仍由浏览器验证；不能因为构建成功就声称页面内容或交互一定正确。

## 回滚

读取 main/publish.json 找到对应的 source 提交。用一个新的 source 提交恢复选定版本，保留 Git 历史，再完整生成并发布 main。不要只回滚 HTML 而遗漏文章源文件。不要强制覆盖分支历史。
