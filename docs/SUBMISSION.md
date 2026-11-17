# 提交前操作

1. 阅读 src/model.ts 与 src/main.tsx，实际运行并按课程规定披露 AI 辅助情况。
2. 完成自己的修改与测试，保持至少 3 次实际、有意义的 Git 提交，不伪造作者和时间。
3. 在个人 GitHub 创建仓库，上传代码与 docs，确认默认分支可构建；新建功能分支发起 PR。
4. 发布 v1.0.0 Release，可附源码 ZIP。截图展示 GitHub 提交列表，运行 `git shortlog -sne --all` 统计每位实际作者。
5. 录制连续完整运行视频，建议 3–5 分钟：
   - 展示运行地址及首页；新增联系人。
   - 为同一联系人添加两个电话、邮箱、社交账号、地址。
   - 收藏并切换收藏视图；刷新证明持久化。
   - 编辑一个字段；搜索已知及不存在的联系人。
   - 导出 Excel 并用 Excel 打开，展示每人一行、每类一列。
   - 先备份数据，导入模板填写的联系人，展示成功结果。
   - 导入表头错误文件，展示现有联系人未改变。
   - 删除一位虚构联系人。
6. 博客草稿 docs/BLOG.md 中补齐姓名学号、课程作业链接、仓库/规范/PR/Release 链接、真实提交截图、视频链接和本人 PSP 耗时。
7. 博客平台未指定，无法代为选择发布；将 Markdown 和截图上传到指定平台，检查目录、图片、链接及审核状态。
8. 截止 2026-11-17 23:59（以课程平台时区为准）；为审核预留时间。

## 发布到 GitHub 的命令参考

不要覆盖已有仓库的历史。仅用于新建空仓库：

```bash
git remote add github https://github.com/dante991227-maker/contact-studio-xp.git
git push github main --tags
```

如果已有 origin，新增 github 远程即可，不需要删除 origin。保持 git 历史；ZIP 中带有 Git bundle，可用 `git clone contact-studio.bundle contact-studio` 恢复历史。
