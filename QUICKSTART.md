# 🚀 Pineappleblog Editor v1.0.0 快速启动指南

## 📦 项目已创建完成

恭喜！一个完整的 Pineappleblog Editor v1.0.0 项目已经创建完成。

## 🎯 立即开始

### 第一步：安装依赖

```bash
# 安装前端依赖
pnpm install
# 或者
npm install
```

### 第二步：确保已安装 Hugo 或 Zola

**macOS:**
```bash
# 安装 Hugo
brew install hugo

# 或安装 Zola
brew install zola

# 验证安装
hugo version
zola --version
```

**其他平台请参考:**
- Hugo: https://gohugo.io/installation/
- Zola: https://www.getzola.org/documentation/getting-started/installation/

### 第三步：启动开发环境

```bash
pnpm tauri:dev
```

应用窗口将自动打开！🎉

## ✨ 核心功能演示

### 1️⃣ 创建你的第一个博客项目

1. 在主界面点击 **"📦 创建新项目"**
2. 填写信息：
   - **项目名称**: `my-blog`
   - **项目路径**: 选择一个空文件夹（如 `~/Documents/my-blog`）
   - **静态引擎**: 选择 `Hugo` 或 `Zola`
3. 点击 **"创建项目"**

### 2️⃣ 创建第一篇文章

1. 进入项目后，点击 **"✍️ 新建文章"**
2. 输入标题：`我的第一篇博客`
3. 文章将自动创建在项目的 `content/posts/` 目录

### 3️⃣ 构建和预览

1. 点击顶部工具栏的 **"构建站点"** 按钮
2. 等待构建完成（通常 < 5 秒）
3. 点击 **"启动预览"** 按钮
4. 浏览器会自动打开 http://localhost:1313 显示你的博客！

## 📁 项目文件说明

创建项目后，你会看到以下文件结构（以 Hugo 为例）：

```
my-blog/
├── archetypes/          # 文章模板
├── content/             # 内容目录
│   └── posts/          # 博客文章
│       └── my-first-post.md
├── layouts/             # 自定义布局（可选）
├── static/              # 静态资源（图片、CSS、JS）
├── themes/              # 主题目录
├── config.toml          # 站点配置文件
└── public/              # 构建输出（自动生成）
```

## 🔧 配置站点信息

编辑项目根目录的 `config.toml`（Hugo）或 `config.toml`（Zola）：

**Hugo 示例:**
```toml
baseURL = "https://example.com/"
languageCode = "zh-cn"
title = "我的博客"
theme = "your-theme"

[params]
  description = "这是我的个人博客"
  author = "你的名字"
```

**Zola 示例:**
```toml
base_url = "https://example.com"
title = "我的博客"
description = "这是我的个人博客"

[extra]
  author = "你的名字"
```

## 🎨 安装主题（可选）

### Hugo 主题

1. 访问 [Hugo Themes](https://themes.gohugo.io/)
2. 选择一个主题，例如 [PaperMod](https://github.com/adityatelange/hugo-PaperMod)
3. 按照主题文档安装：

```bash
cd my-blog
git clone https://github.com/adityatelange/hugo-PaperMod themes/PaperMod --depth=1
```

4. 在 `config.toml` 中设置 `theme = "PaperMod"`

### Zola 主题

1. 访问 [Zola Themes](https://www.getzola.org/themes/)
2. 选择主题并按文档安装

## 📝 编辑文章

文章使用 Markdown 格式编写。示例：

```markdown
+++
title = "我的第一篇文章"
date = 2024-01-01
draft = false

[taxonomies]
tags = ["博客", "技术"]
categories = ["教程"]
+++

# 欢迎来到我的博客

这是我的第一篇文章！

## 支持的功能

- **粗体文本**
- *斜体文本*
- [链接](https://example.com)
- 代码块

\`\`\`javascript
console.log('Hello World!')
\`\`\`

## 添加图片

![示例图片](images/example.jpg)
```

## 🌐 部署到线上

### 方式 1: GitHub Pages

1. 在 GitHub 创建仓库
2. 推送项目到仓库
3. 在仓库设置中启用 GitHub Pages
4. 选择分支和目录（通常是 `main` 分支的 `/public` 目录）

### 方式 2: Netlify

1. 注册 [Netlify](https://netlify.com)
2. 连接 GitHub 仓库
3. 设置构建命令：`hugo` 或 `zola build`
4. 发布目录：`public`
5. 点击部署

### 方式 3: Vercel

1. 注册 [Vercel](https://vercel.com)
2. 导入项目
3. Vercel 会自动检测并配置

## 🎯 下一步

### 学习资源

- **Hugo 文档**: https://gohugo.io/documentation/
- **Zola 文档**: https://www.getzola.org/documentation/
- **Markdown 教程**: https://www.markdownguide.org/

### 功能扩展

当前版本实现的核心功能：
- ✅ 项目创建和管理
- ✅ 文章创建
- ✅ 站点构建
- ✅ 本地预览

计划中的功能：
- 🚧 集成 Markdown 编辑器
- 🚧 主题市场
- 🚧 一键部署
- 🚧 图片管理
- 🚧 文章搜索

## ❓ 常见问题

### Q: 启动失败，提示找不到 Hugo/Zola？
**A:** 请确保已正确安装 Hugo 或 Zola，并且可以在终端中运行 `hugo version` 或 `zola --version`。

### Q: 预览页面显示 404？
**A:** 确保：
1. 项目已成功构建
2. 文章的 `draft` 属性设置为 `false`
3. 主题配置正确

### Q: 如何更改预览端口？
**A:** 默认端口是 1313。如果被占用，可以在启动预览时指定其他端口（目前需要修改代码）。

### Q: 可以同时管理多个博客吗？
**A:** 可以！使用 "打开项目" 功能在不同项目间切换。

## 🐛 问题反馈

如果遇到问题：
1. 查看终端输出的错误信息
2. 检查 Hugo/Zola 版本是否兼容
3. 确认项目目录结构正确

## 🎉 开始创作吧！

现在你已经准备好开始创作内容了。记住：

1. **内容为王** - 专注于写作优质内容
2. **保持简单** - 从基础开始，逐步学习
3. **定期备份** - 使用 Git 管理你的内容
4. **享受过程** - 静态博客让你专注于写作本身

Happy Blogging! 🚀✨

---

**Made with ❤️ by Pineappleblog Team**
