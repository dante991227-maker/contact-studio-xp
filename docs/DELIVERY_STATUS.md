# 当前交付状态

更新：2026-11-17。

- 核心程序、源码、运行说明、代码规范、自动测试和实际浏览器截图已完成。
- 生产构建成功，5 项自动测试通过。
- Git bundle 历史有 4 次真实提交，标签 v1.0.0。作者 Project Assistant，未冒充学生。
- 线上部署成功：https://contact-studio-xp-20261117.bluishduet3.chatgpt.site
- 该站当前仅拥有者可访问，需 ChatGPT 登录；不应当作老师可直接验收的公开部署。
- GitHub 仓库已创建：https://github.com/dante991227-maker/contact-studio-xp 。源码与材料通过功能分支提交；GitHub Release 尚未创建。
- Git bundle 保留全部源码历史和 v1.0.0 标签，可在本机恢复，之后推送新仓库。
- 博客为 Markdown 草稿，未发布到任何博客平台；姓名学号、课程表头原文、实际 PSP、GitHub 链接和提交历史截图仍待补充。
- 截图是实际运行证据；当前未生成连续完整运行录屏。录屏顺序见 SUBMISSION.md。

## 从打包材料恢复 Git 历史

在解压目录运行：

```bash
git clone contact-studio.bundle contact-studio
cd contact-studio
npm ci
npm test
npm run dev
```

默认分支 main，v1.0.0 标签保留。创建 GitHub 空仓库后添加该仓库为 github 远程，再推送 main 和 tags。不要把部署用的私有源码远程地址误填成 GitHub 地址。

## GitHub 交付说明

GitHub 初始 README 提交被保留。项目通过 feat/contact-studio 分支导入，原始开发提交与 v1.0.0 标签保存在 contact-studio.bundle 中，可按上文命令恢复。GitHub 网页提交记录不等同于 bundle 的原始历史。

本次重新运行：5 项自动测试通过；生产构建结果以本次交付记录为准。博客发布、真实 PSP、个人信息、完整录屏及教师可访问部署仍需补齐。
