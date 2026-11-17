# 代码规范

- 使用 TypeScript strict 模式；业务对象定义明确的类型。
- React 函数组件，状态不可变更新；不直接修改联系人数组。
- 变量和函数采用 camelCase，类型和组件采用 PascalCase。
- 使用 Prettier 统一格式：单引号、分号、100 字符目标行宽。
- 数据校验及 Excel 转换放在 model.ts；界面交互放在 main.tsx。
- 对本地存储与 Excel 解析捕获异常；整批验证成功后才修改现有数据。
- 用户输入通过 React 文本节点渲染，不使用 dangerouslySetInnerHTML。
- 不提交真实联系人、口令、访问令牌或 node_modules。
- 提交信息用 `feat:`、`fix:`、`test:`、`docs:` 前缀描述实际变化。
- 功能分支开发，通过 PR 记录差异；发布前运行 `npm test` 和 `npm run build`。
