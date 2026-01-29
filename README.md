# Pienapple Blog Editor

<div align="center">

![Logo](loguUrl)

**小白友好的静态网站编辑器**

一款基于 Tauri 的跨平台静态网站编辑器，支持 Hugo 和 Zola，让创建和管理静态博客变得简单直观。

</div>

---

## 特性

### 核心功能
- **零配置启动** - 内置 Hugo 引擎，开箱即用
- **主题市场** - 精选优质主题，一键安装切换（Butterfly等）
- **智能编辑器** - 所见即所得 + Markdown 源码双模式
- **实时预览** - 修改即刻可见，支持热重载
- **完全跨平台** - Windows、macOS、Linux 统一体验

### 进阶特性（目前还没有）
- **媒体管理** - 拖拽上传图片，自动压缩优化
- **可视化配置** - 表单化编辑站点配置，告别复杂的 TOML/YAML
- **Front Matter 编辑器** - 标签、分类、日期等元数据图形化管理
- **全文搜索** - 快速定位文章和资源
- **一键部署** - 支持 GitHub Pages、Netlify、Vercel
- **主题定制** - 内置颜色选择器、字体管理器

---

## 截图

<div align="center">

### 主界面
![主界面]()

### 编辑器
![编辑器]()

### 主题市场
![主题市场]()

</div>

---

## 快速开始

### 下载安装(还没有)

#### Windows
```powershell
# 下载最新版本
winget install PineappleBlogEditor

# 或直接下载安装包
# https://github.com/
```

#### macOS
```bash
# 使用 Homebrew
brew install --cask pineappleblog-editor

# 或下载 .dmg 文件
```

#### Linux
```bash
# Debian/Ubuntu
sudo dpkg -i pineappleblog-editor_1.0.0_amd64.deb

# Arch Linux
yay -S pineappleblog-editor

# AppImage（通用）
chmod +x PineappleBlogEditor-1.0.0.AppImage
./PineappleBlogEditor-1.0.0.AppImage
```

### 初次使用

1. **创建新项目**
   - 启动应用
   - 点击「新建项目」
   - 选择引擎（Hugo/Zola）和主题
   - 填写站点基本信息

2. **撰写第一篇文章**
   - 左侧栏点击「新建文章」
   - 使用编辑器撰写内容
   - 右侧实时预览效果

3. **发布网站**
   - 点击顶部「构建」按钮
   - 选择「部署到...」
   - 按照向导完成部署

---

## 开发指南

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | 响应式 UI，类型安全 |
| UI 组件库 | Element Plus | 企业级组件库 |
| 样式方案 | TailwindCSS | 实用优先的 CSS 框架 |
| 编辑器 | Monaco Editor | VS Code 同款编辑器 |
| 后端运行时 | Tauri 2.0 | Rust 驱动的轻量级桌面应用 |
| 静态引擎 | Hugo / Zola | 内置二进制文件 |
| 状态管理 | Pinia | Vue 官方推荐 |
| 路由 | Vue Router | 单页应用路由 |

### 项目结构

```
pineappleblog-editor/
├── src/                      # 前端源码
│   ├── assets/              # 静态资源
│   ├── components/          # Vue 组件
│   │   ├── Editor/         # 编辑器组件
│   │   ├── ThemeMarket/    # 主题市场
│   │   └── Settings/       # 设置面板
│   ├── stores/             # Pinia 状态管理
│   ├── views/              # 页面视图
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
│
├── src-tauri/               # Tauri 后端
│   ├── src/
│   │   ├── commands/       # Tauri 命令
│   │   │   ├── hugo.rs    # Hugo 相关操作
│   │   │   ├── zola.rs    # Zola 相关操作
│   │   │   ├── file.rs    # 文件系统操作
│   │   │   └── deploy.rs  # 部署功能
│   │   ├── models/         # 数据模型
│   │   ├── utils/          # 工具函数
│   │   └── main.rs         # Rust 入口
│   ├── icons/              # 应用图标
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
│
├── themes/                  # 内置主题包
│   ├── hugo/
│   │   ├── butterfly/
│   │   └── paper/
│   └── zola/
│       └── duckquill/
│
├── binaries/                # 静态引擎二进制文件（Git LFS）
│   ├── hugo-windows.exe
│   ├── hugo-darwin
│   ├── hugo-linux
│   ├── zola-windows.exe
│   ├── zola-darwin
│   └── zola-linux
│
├── public/                  # 公共资源
├── tests/                   # 测试文件
├── package.json
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # TailwindCSS 配置
└── README.md
```

### 环境要求

- **Node.js** >= 18.0.0
- **Rust** >= 1.70.0
- **pnpm** >= 8.0.0（推荐）

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/loveustars/pineappleblog-editor.git
cd pineappleblog-editor

# 安装前端依赖
pnpm install

# 安装 Tauri CLI
cargo install tauri-cli

# 下载静态引擎二进制（使用 Git LFS）
git lfs pull
```

### 开发模式

```bash
# 启动开发服务器（前端热重载 + Rust 后端）
pnpm tauri dev

# 或分别启动
pnpm dev          # 前端开发服务器
cargo tauri dev   # Tauri 应用
```

### 构建应用

```bash
# 构建生产版本
pnpm tauri build

# 构建输出位置
# Windows: src-tauri/target/release/bundle/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/deb/
```

### 代码规范

```bash
# 代码格式化
pnpm format

# ESLint 检查
pnpm lint

# TypeScript 类型检查
pnpm type-check

# Rust 格式化
cargo fmt

# Rust 代码检查
cargo clippy
```

---

## 🔌 核心 API 示例

### Tauri Commands

```rust
// src-tauri/src/commands/hugo.rs

#[tauri::command]
pub async fn create_hugo_site(
    project_path: String,
    site_name: String,
) -> Result<String, String> {
    let hugo_binary = get_hugo_binary_path()?;
    
    let output = Command::new(hugo_binary)
        .args(&["new", "site", &site_name])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to create site: {}", e))?;
    
    if output.status.success() {
        Ok(format!("Site '{}' created successfully", site_name))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn build_hugo_site(
    project_path: String,
) -> Result<BuildResult, String> {
    let hugo_binary = get_hugo_binary_path()?;
    
    let start = Instant::now();
    let output = Command::new(hugo_binary)
        .args(&["--gc", "--minify"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Build failed: {}", e))?;
    
    Ok(BuildResult {
        success: output.status.success(),
        duration: start.elapsed().as_secs_f64(),
        output: String::from_utf8_lossy(&output.stdout).to_string(),
    })
}

#[tauri::command]
pub async fn serve_hugo_preview(
    project_path: String,
    port: u16,
) -> Result<(), String> {
    let hugo_binary = get_hugo_binary_path()?;
    
    Command::new(hugo_binary)
        .args(&[
            "server",
            "-D",  // 包含草稿
            "--bind", "127.0.0.1",
            "--port", &port.to_string(),
            "--navigateToChanged",
        ])
        .current_dir(&project_path)
        .spawn()
        .map_err(|e| format!("Failed to start server: {}", e))?;
    
    Ok(())
}
```

### Vue 组件调用

```typescript
// src/composables/useHugo.ts
import { invoke } from '@tauri-apps/api/tauri'

export function useHugo() {
  const createSite = async (projectPath: string, siteName: string) => {
    try {
      const result = await invoke<string>('create_hugo_site', {
        projectPath,
        siteName,
      })
      return { success: true, message: result }
    } catch (error) {
      return { success: false, message: error as string }
    }
  }

  const buildSite = async (projectPath: string) => {
    return await invoke<BuildResult>('build_hugo_site', {
      projectPath,
    })
  }

  const startPreview = async (projectPath: string, port = 1313) => {
    return await invoke('serve_hugo_preview', {
      projectPath,
      port,
    })
  }

  return {
    createSite,
    buildSite,
    startPreview,
  }
}
```

---

## 主题开发

### 主题结构

```
my-theme/
├── theme.toml              # 主题元数据
├── screenshot.png          # 主题预览图（1280x720）
├── layouts/                # 模板文件
├── static/                 # 静态资源
└── assets/                 # 需要处理的资源
```

### 主题配置 (theme.toml)

```toml
name = "My Awesome Theme"
license = "TBD"
licenselink = "https://github.com/user/theme/blob/main/LICENSE"
description = "A beautiful theme for Hugo"
homepage = "https://github.com/user/theme"
tags = ["blog", "minimal", "responsive"]
features = ["dark-mode", "search", "comments"]
min_version = "0.112.0"

[author]
  name = "Your Name"
  homepage = "https://yoursite.com"

[editor_config]
  primary_color = "#3498db"
  supports_dark_mode = true
  custom_options = [
    { name = "show_toc", label = "显示目录", type = "boolean", default = true },
    { name = "posts_per_page", label = "每页文章数", type = "number", default = 10 }
  ]
```

### 提交主题(没有呢～～)

1. Fork [主题仓库](https://github.com/yourusername/pineappleblog-editor-themes)
2. 添加你的主题到 `themes/hugo/` 或 `themes/zola/`
3. 提交 Pull Request
4. 等待审核通过

---

## 配置文件

### 应用配置 (~/.pineappleblog-editor/config.json)

```json
{
  "version": "1.0.0",
  "editor": {
    "fontSize": 14,
    "fontFamily": "JetBrains Mono",
    "theme": "vs-dark",
    "wordWrap": "on",
    "autoSave": true,
    "autoSaveDelay": 1000
  },
  "preview": {
    "defaultPort": 1313,
    "autoRefresh": true,
    "openBrowserOnStart": true
  },
  "projects": {
    "recentProjects": [
      "/Users/name/my-blog",
      "/Users/name/docs-site"
    ],
    "defaultEngine": "hugo"
  },
  "deployment": {
    "githubToken": "encrypted_token_here",
    "netlifyToken": "encrypted_token_here"
  }
}
```

---

## 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目** 并创建你的分支
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **提交更改**
   ```bash
   git commit -m 'feat: Add some amazing feature'
   ```
   
   请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

3. **推送到分支**
   ```bash
   git push origin feature/amazing-feature
   ```

4. **创建 Pull Request**

### 提交信息规范

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链相关

### 开发者行为准则

请阅读我们的 [行为准则](CODE_OF_CONDUCT.md)

---

## 路线图

### v1.0.0（当前版本）
- [x] 基础项目管理
- [x] Hugo/Zola 支持
- [x] Markdown 编辑器
- [x] 实时预览
- [ ] 5+ 内置主题

### v1.1.0（计划中）

- [ ] Git 集成（版本控制）
- [ ] 图片拖拽上传
- [ ] 自动图片压缩
- [ ] 主题自定义工具
- [ ] 多语言支持（i18n）
- [ ] AI 写作助手
- [ ] 协作编辑（WebSocket）
- [ ] 插件系统
- [ ] 模板市场

---

## 常见问题

<details>
<summary><b>Hugo 和 Zola 有什么区别？</b></summary>

- **Hugo**：Go 编写，生态丰富，主题多，适合博客和文档站点
- **Zola**：Rust 编写，配置简单，速度极快，适合追求极简的用户

两者都是优秀的静态站点生成器，选择取决于个人偏好。
</details>

<details>
<summary><b>如何导入现有的 Hugo/Zola 项目？</b></summary>

1. 点击「打开项目」
2. 选择包含 `config.toml`/`config.yaml` 的文件夹
3. 应用会自动识别引擎类型
</details>

<details>
<summary><b>主题安装后在哪里？</b></summary>

主题会被复制到项目的 `themes/` 目录下，并自动修改配置文件。
</details>

<details>
<summary><b>支持自定义域名吗？</b></summary>

支持！在部署设置中可以配置自定义域名，支持 GitHub Pages CNAME 和 Netlify/Vercel 自定义域名。
</details>

<details>
<summary><b>数据存储在哪里？</b></summary>

- 项目文件：存储在你选择的位置
- 应用配置：`~/.pineappleblog-editor/`
- 主题缓存：`~/.pineappleblog-editor/themes/`
</details>

---

## 许可证


---

## 致谢

- [Tauri](https://tauri.app/) - 强大的桌面应用框架
- [Hugo](https://gohugo.io/) - 世界上最快的静态网站生成器
- [Zola](https://www.getzola.org/) - 快速且灵活的静态网站生成器
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 编辑器内核
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- 所有贡献者和主题开发者

---

## 联系方式

- **问题反馈**：[GitHub Issues](https://github.com/loveustars/Pineapple-Blog/issues)
- **功能建议**：[GitHub Discussions](https://github.com/loveustars/Pineapple-Blog/discussions)
- **邮件联系**：no~
- **社区讨论**：nothing~

---

<div align="center">

**如果这个项目对你有帮助，请给我一个 ⭐️**

Made by 千早爱音（戴眼镜版）

</div>