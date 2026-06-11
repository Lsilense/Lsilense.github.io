# CLAUDE.md

本文件为 Claude Code（claude.ai/code）提供操作指引，帮助理解本仓库的代码结构与约定。

## 构建 / 预览

- **纯静态站点** — 无构建工具，无 package.json，无打包器。直接使用原生 HTML、CSS、JS。
- **本地预览：** 直接在浏览器打开任意 `.html` 文件，或通过 `python3 -m http.server 8000` 启动服务。
- **部署：** 推送到 `main` 分支后，GitHub Pages 自动部署 `https://github.com/Lsilense/Lsilense.github.io`。无需手动构建。

## 项目结构

```
├── index.html         # 首页（hero 区、研究方向、技术栈、最新文章）
├── posts.html         # 文章列表页（搜索/标签筛选、侧边栏统计）
├── projects.html      # 项目展示页（从 projects.json 动态加载）
├── research.html      # 研究方向详情页
├── tech-stack.html    # 技术栈页面
├── css/style.css      # 统一样式文件（深色/浅色主题通过 CSS 变量实现）
├── js/main.js         # 公共 JS（主题切换、移动端菜单、导航栏滚动效果）
├── posts.json         # 文章元数据（id、标题、日期、摘要、标签）
├── projects.json      # 项目元数据（id、图标、标题、摘要、标签、链接）
├── posts/             # 单篇文章的 HTML 文件
│   ├── deepseek.html
│   └── qwen2.html
└── projects/          # 单个项目的详情 HTML 文件
    └── smart-cs.html
```

## 关键模式

- **主题系统：** 通过 `:root`（深色）和 `[data-theme="light"]` 上定义 CSS 变量实现。主题状态存储在 `localStorage` 的 `blog-theme` 键中。`<head>` 中的内联阻塞脚本防止页面闪烁。
- **数据驱动内容：** 文章和项目以 JSON（`posts.json`、`projects.json`）管理。页面在运行时 fetch JSON 并渲染卡片列表，详情页使用静态 HTML。
- **导航：** 所有页面共享导航栏，通过 `.active` 类标记当前页面。移动端菜单通过切换 `#nav-links` 的 `.open` 类实现。
- **字体：** Sora（标题）、DM Sans（正文）、JetBrains Mono（代码），通过 Google Fonts 加载。
- **动画：** `.post-card` 使用 `fadeUp` 关键帧动画，通过递增的 `animation-delay` 实现错落效果，纯 CSS 实现，无 JS 动画库。
- **响应式：** 断点为 1024px、768px、480px。文章列表页在 768px 以下从两栏切换为单栏。
- **文章标签：** `posts.html` 通过标签筛选文章，支持 URL 查询参数 `?tag=X` 实现深度链接。

## 新增内容

### 新增文章
1. 在 `posts/` 目录下创建 `<id>.html` — 参考现有文章的模板（共享导航栏、页脚、post-detail 布局）。
2. 在 `posts.json` 中添加对应条目，`id` 与文件名保持一致。
3. 首页统计信息会自动从 `posts.json` 计算，无需手动更新。

### 新增项目
1. 在 `projects/` 目录下创建 `<id>.html` 详情页。
2. 在 `projects.json` 中添加对应条目。

## 技术栈

- 静态托管：GitHub Pages
- 字体：Google Fonts（Sora、DM Sans、JetBrains Mono）
- 图标：内联 SVG
- 无框架、无运行时依赖