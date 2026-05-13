# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/zh-CN/).

## [0.1.0] - 2026-05-13

### 初始版本

- 替换 Chrome 新标签页，提供可自定义的工作入口
- 聚合 9 个 AI 工具：ChatGPT、Claude、Grok、Gemini、Kimi、DeepSeek、Qwen、豆包、Perplexity
- 聚合 11 个搜索引擎：Google、Bing、百度、DuckDuckGo、Brave、搜狗、360、Yandex、GitHub、知乎、B站
- 快捷访问管理：添加、编辑、删除、拖拽排序，自动获取网站 favicon
- 实用小组件：天气、时间（支持秒/12小时制）、日期（多种格式）、每日金句、便签、自选股
- 插件化布局：显示/隐藏、拖拽位置、缩放大小、框选多选
- 样式系统：3 种预设主题 + 自定义背景图
- 字体库：10 款中文字体 + 9 款英文字体，支持按插件单独设置
- 背景定制：自定义颜色 + 透明度调节
- AI 聚合跳转：输入提示词后自动填入对应 AI 服务页面

### 技术

- 基于 Vite + TypeScript + SCSS 构建
- 模块化代码架构
- GitHub Actions CI/CD 自动打包
