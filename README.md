# AI 聚合起始页

一个可自定义的 Chrome 新标签页扩展，聚合 AI 工具、搜索引擎、快捷访问、天气、时间、便签和自选股。

[English README](./README.en.md) (Coming soon)

---

## 功能

- **AI 聚合**：ChatGPT、Claude、Grok、Gemini、Kimi、DeepSeek、Qwen、豆包、Perplexity
- **搜索引擎**：Google、Bing、百度、DuckDuckGo、Brave、搜狗、360、Yandex、GitHub、知乎、B 站
- **快捷访问**：添加、编辑、删除、拖拽排序，自动获取网站 favicon
- **实用小组件**：天气、时间（支持秒/12 小时制）、日期、每日金句、便签、自选股
- **自由布局**：插件可拖拽位置、缩放大小、框选多选
- **主题系统**：3 种预设主题 + 自定义背景图
- **字体库**：10 款中文字体 + 9 款英文字体
- **背景定制**：自定义颜色 + 透明度调节

---

## 安装

### 从 Chrome Web Store 安装（推荐）

> 审核中，即将上线

### 本地安装（开发者模式）

1. 下载 [最新 Release](https://github.com/viamons/ai-startpage/releases)
2. 解压 ZIP 文件
3. 打开 Chrome 扩展管理页：`chrome://extensions/`
4. 开启右上角「开发者模式」
5. 点击「加载已解压的扩展程序」，选择解压后的文件夹

---

## 开发

```bash
# 克隆仓库
git clone https://github.com/viamons/ai-startpage.git
cd ai-startpage

# 安装依赖
npm install

# 开发模式（支持热更新）
npm run dev

# 构建生产版本
npm run build

# 打包 ZIP（用于 CWS 上架）
npm run zip

# 运行测试
npm run test
```

---

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [SCSS](https://sass-lang.com/) — 样式系统
- [Vitest](https://vitest.dev/) — 单元测试

---

## 隐私

扩展不会收集或上传用户数据到开发者服务器。所有设置和数据保存在用户本地浏览器中。

- 天气数据来自 [Open-Meteo](https://open-meteo.com/)
- 股票数据来自 [Yahoo Finance](https://finance.yahoo.com/)

详细隐私政策见 [PRIVACY.md](./docs/PRIVACY.md)。

---

## 开源协议

[MIT](./LICENSE)

---

## 贡献

欢迎提交 Issue 和 PR！

## 截图

> 截图将在这里展示
