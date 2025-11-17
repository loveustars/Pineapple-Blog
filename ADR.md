# Pineapple Blog Editor - Architecture Design Document

**Version:** 1.0.0  
**Last Updated:** 2025-11-17  
**Status:** Draft → Review → **Approved**

---

## 📑 目录

- [1. 项目概述](#1-项目概述)
- [2. 架构目标与约束](#2-架构目标与约束)
- [3. 系统架构](#3-系统架构)
- [4. 技术栈选型](#4-技术栈选型)
- [5. 模块设计](#5-模块设计)
- [6. 数据流设计](#6-数据流设计)
- [7. 安全性设计](#7-安全性设计)
- [8. 性能优化策略](#8-性能优化策略)
- [9. 扩展性设计](#9-扩展性设计)
- [10. 部署架构](#10-部署架构)
- [11. 测试策略](#11-测试策略)
- [12. 技术债务与风险](#12-技术债务与风险)

---

## 1. 项目概述

### 1.1 项目背景

Pineapple Blog Editor 是一款面向非技术用户的桌面应用，旨在简化静态网站（特别是博客）的创建和管理流程。通过图形化界面封装 Hugo 和 Zola 的命令行操作，降低静态网站的使用门槛。

### 1.2 核心价值主张

- **零技术门槛**：用户无需了解命令行、Git 或 Markdown 语法
- **跨平台一致性**：Windows/macOS/Linux 统一体验
- **轻量高效**：安装包 < 50MB，内存占用 < 200MB
- **离线可用**：核心功能不依赖网络

### 1.3 目标用户

| 用户类型 | 技术水平 | 主要需求 |
|---------|---------|---------|
| 博客作者 | 初级 | 简单创建、编辑、发布博客 |
| 个人开发者 | 中级 | 快速搭建技术文档/作品集 |
| 内容创作者 | 初级 | 专注写作，自动化发布流程 |
| 技术团队 | 高级 | 批量管理多个站点 |

---

## 2. 架构目标与约束

### 2.1 质量属性需求

| 属性 | 目标 | 度量标准 |
|------|------|----------|
| **性能** | 流畅编辑体验 | 编辑器输入延迟 < 50ms<br>预览刷新 < 1s |
| **可靠性** | 防止数据丢失 | 自动保存间隔 1s<br>崩溃恢复成功率 > 99% |
| **可用性** | 小白友好 | 新用户 5 分钟内发布第一篇文章 |
| **可移植性** | 跨平台 | Windows 7+、macOS 10.13+、Linux (主流发行版) |
| **可维护性** | 代码质量 | 测试覆盖率 > 80%<br>模块耦合度低 |
| **安全性** | 用户数据安全 | 敏感信息加密存储<br>无远程代码执行风险 |

### 2.2 技术约束

- **前端限制**：必须使用 Web 技术栈（便于快速迭代）
- **二进制文件**：Hugo/Zola 二进制文件总大小 < 100MB
- **依赖管理**：避免过多外部依赖，减少供应链攻击风险
- **向后兼容**：配置文件格式必须保持兼容性

### 2.3 业务约束

- **开源协议**：MIT License，允许商业使用
- **多语言支持**：初期支持中文/英文，架构支持 i18n 扩展
- **离线优先**：核心功能必须在无网络环境下可用

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Editor     │  │Theme Market  │  │  Settings    │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                   │                   │            │
│         └───────────────────┴───────────────────┘            │
│                             ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Vue 3 + Pinia State Management           │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Tauri IPC Bridge (JavaScript)              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Core Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Command    │  │   Service    │  │   Repository │      │
│  │   Handler    │  │    Layer     │  │    Layer     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                   │                   │            │
│         └───────────────────┴───────────────────┘            │
│                             ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Domain Models & Business Logic (Rust)         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Process    │  │     File     │  │   Database   │      │
│  │   Manager    │  │    System    │  │  (SQLite)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                   │                   │            │
│         ▼                   ▼                   ▼            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Hugo/Zola Bin │  │  OS APIs     │  │   Config     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 分层职责

#### 3.2.1 User Interface Layer（前端层）
- **职责**：用户交互、视图渲染、本地状态管理
- **技术**：Vue 3, TypeScript, TailwindCSS, Monaco Editor
- **通信**：通过 Tauri IPC 与后端通信

#### 3.2.2 Application Core Layer（应用核心层）
- **职责**：业务逻辑编排、命令处理、服务协调
- **技术**：Rust
- **模式**：CQRS（命令查询职责分离）

#### 3.2.3 Infrastructure Layer（基础设施层）
- **职责**：外部资源访问、系统调用、持久化
- **技术**：Rust std library, tokio (异步运行时)

---

## 4. 技术栈选型

### 4.1 核心技术决策

#### 决策 1: 为什么选择 Tauri？

**背景**：需要跨平台桌面应用框架

| 方案 | 优势 | 劣势 | 评分 |
|------|------|------|------|
| **Tauri** ✅ | • 体积小（~3MB）<br>• 性能好<br>• 安全性高<br>• Web 前端生态 | • 生态较新<br>• 社区相对小 | ⭐⭐⭐⭐⭐ |
| Electron | • 生态成熟<br>• 资源丰富 | • 体积大（150MB+）<br>• 内存占用高 | ⭐⭐⭐ |
| Flutter | • UI 性能好<br>• 移动端支持 | • 与 CLI 工具集成复杂<br>• Web 前端不可用 | ⭐⭐ |

**决策**：选择 Tauri
- **理由**：轻量高效符合项目定位，Rust 后端便于集成 CLI 工具

#### 决策 2: 为什么选择 Vue 3？

| 方案 | 优势 | 劣势 | 评分 |
|------|------|------|------|
| **Vue 3** ✅ | • 学习曲线平缓<br>• 响应式系统强大<br>• 组件化开发<br>• TypeScript 支持好 | • 社区比 React 小 | ⭐⭐⭐⭐⭐ |
| React | • 生态最大<br>• 招聘容易 | • 学习曲线陡<br>• 状态管理复杂 | ⭐⭐⭐⭐ |
| Svelte | • 性能最好<br>• 代码量少 | • 生态小<br>• 组件库少 | ⭐⭐⭐ |

**决策**：选择 Vue 3
- **理由**：表单密集型应用，Vue 的双向绑定和 Composition API 开发效率高

#### 决策 3: 状态管理为什么用 Pinia？

**决策**：使用 Pinia 替代 Vuex
- **理由**：
  - Vue 3 官方推荐
  - TypeScript 支持更好
  - API 更简洁（无 mutations）
  - 模块化更清晰

### 4.2 技术栈总览

```yaml
Frontend:
  Framework: Vue 3.4+
  Language: TypeScript 5.0+
  State: Pinia 2.1+
  Router: Vue Router 4.0+
  UI:
    Component: Element Plus 2.5+
    Style: TailwindCSS 3.4+
    Icons: lucide-vue-next
  Editor: Monaco Editor 0.45+
  Build: Vite 5.0+

Backend:
  Language: Rust 1.75+
  Framework: Tauri 2.0+
  Async Runtime: tokio 1.35+
  Serialization: serde 1.0+
  Database: rusqlite 0.30+ (SQLite)
  HTTP Client: reqwest 0.11+ (for deployment)

Static Engines:
  Hugo: v0.121+ (embedded binary)
  Zola: v0.18+ (embedded binary)

DevOps:
  Version Control: Git
  CI/CD: GitHub Actions
  Package Manager: pnpm (frontend), cargo (backend)
  Testing: vitest (frontend), cargo test (backend)
```

---

## 5. 模块设计

### 5.1 前端模块架构

```
src/
├── modules/
│   ├── project/              # 项目管理模块
│   │   ├── components/
│   │   │   ├── ProjectList.vue
│   │   │   ├── ProjectCreator.vue
│   │   │   └── ProjectSettings.vue
│   │   ├── stores/
│   │   │   └── projectStore.ts
│   │   ├── composables/
│   │   │   └── useProject.ts
│   │   └── types/
│   │       └── project.d.ts
│   │
│   ├── editor/               # 编辑器模块
│   │   ├── components/
│   │   │   ├── MarkdownEditor.vue
│   │   │   ├── FrontMatterForm.vue
│   │   │   ├── MediaUploader.vue
│   │   │   └── PreviewPane.vue
│   │   ├── stores/
│   │   │   └── editorStore.ts
│   │   └── utils/
│   │       ├── markdownParser.ts
│   │       └── imageOptimizer.ts
│   │
│   ├── theme/                # 主题管理模块
│   │   ├── components/
│   │   │   ├── ThemeMarket.vue
│   │   │   ├── ThemePreview.vue
│   │   │   └── ThemeCustomizer.vue
│   │   ├── stores/
│   │   │   └── themeStore.ts
│   │   └── types/
│   │       └── theme.d.ts
│   │
│   ├── deployment/           # 部署模块
│   │   ├── components/
│   │   │   ├── DeploymentWizard.vue
│   │   │   ├── GitHubPagesConfig.vue
│   │   │   └── NetlifyConfig.vue
│   │   └── composables/
│   │       └── useDeployment.ts
│   │
│   └── settings/             # 设置模块
│       ├── components/
│       │   ├── GeneralSettings.vue
│       │   ├── EditorSettings.vue
│       │   └── AccountSettings.vue
│       └── stores/
│           └── settingsStore.ts
│
├── core/                     # 核心基础设施
│   ├── tauri/               # Tauri 集成
│   │   ├── commands.ts      # 命令封装
│   │   └── events.ts        # 事件监听
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validator.ts
│   │   └── formatter.ts
│   └── constants/
│       └── config.ts
│
└── shared/                   # 共享资源
    ├── components/          # 通用组件
    │   ├── Button.vue
    │   ├── Modal.vue
    │   └── Toast.vue
    └── composables/         # 通用 Hooks
        ├── useNotification.ts
        └── useLoading.ts
```

### 5.2 后端模块架构

```rust
src-tauri/src/
├── commands/                 // Tauri 命令处理器
│   ├── mod.rs
│   ├── project.rs           // 项目 CRUD
│   ├── hugo.rs              // Hugo 操作
│   ├── zola.rs              // Zola 操作
│   ├── file.rs              // 文件系统
│   ├── theme.rs             // 主题管理
│   └── deploy.rs            // 部署功能
│
├── services/                 // 业务逻辑层
│   ├── mod.rs
│   ├── project_service.rs
│   ├── engine_service.rs    // SSG 引擎抽象
│   ├── theme_service.rs
│   └── deploy_service.rs
│
├── repository/               // 数据访问层
│   ├── mod.rs
│   ├── project_repo.rs
│   ├── config_repo.rs
│   └── cache_repo.rs
│
├── models/                   // 领域模型
│   ├── mod.rs
│   ├── project.rs
│   ├── theme.rs
│   ├── config.rs
│   └── post.rs
│
├── engine/                   // SSG 引擎适配器
│   ├── mod.rs
│   ├── traits.rs            // 统一接口定义
│   ├── hugo_adapter.rs
│   └── zola_adapter.rs
│
├── utils/                    // 工具函数
│   ├── mod.rs
│   ├── process.rs           // 进程管理
│   ├── fs.rs                // 文件系统增强
│   ├── crypto.rs            // 加密解密
│   └── validator.rs         // 数据验证
│
├── error.rs                  // 统一错误处理
├── config.rs                 // 应用配置
└── main.rs                   // 入口文件
```

### 5.3 核心模块详解

#### 5.3.1 项目管理模块

**职责**：管理用户的静态网站项目

```rust
// models/project.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub engine: EngineType,
    pub theme: Option<String>,
    pub config: ProjectConfig,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EngineType {
    Hugo,
    Zola,
}

// services/project_service.rs
pub struct ProjectService {
    repo: Arc<ProjectRepository>,
    engine_service: Arc<EngineService>,
}

impl ProjectService {
    pub async fn create_project(
        &self,
        name: String,
        path: PathBuf,
        engine: EngineType,
    ) -> Result<Project> {
        // 1. 验证路径
        self.validate_path(&path)?;
        
        // 2. 创建项目结构
        let project = Project::new(name, path, engine);
        
        // 3. 初始化 SSG 项目
        self.engine_service.init_project(&project).await?;
        
        // 4. 保存到数据库
        self.repo.save(&project).await?;
        
        Ok(project)
    }
}
```

#### 5.3.2 引擎适配器模块

**设计模式**：策略模式 + 适配器模式

```rust
// engine/traits.rs
#[async_trait]
pub trait SiteEngine: Send + Sync {
    /// 初始化新项目
    async fn init(&self, path: &Path, config: &EngineConfig) -> Result<()>;
    
    /// 构建站点
    async fn build(&self, path: &Path, options: &BuildOptions) -> Result<BuildResult>;
    
    /// 启动开发服务器
    async fn serve(&self, path: &Path, port: u16) -> Result<ServerHandle>;
    
    /// 创建新文章
    async fn new_post(&self, path: &Path, title: &str) -> Result<PathBuf>;
    
    /// 验证配置文件
    fn validate_config(&self, path: &Path) -> Result<()>;
    
    /// 获取引擎版本
    fn version(&self) -> Result<String>;
}

// engine/hugo_adapter.rs
pub struct HugoAdapter {
    binary_path: PathBuf,
}

#[async_trait]
impl SiteEngine for HugoAdapter {
    async fn build(&self, path: &Path, options: &BuildOptions) -> Result<BuildResult> {
        let mut cmd = Command::new(&self.binary_path);
        cmd.current_dir(path);
        
        if options.minify {
            cmd.arg("--minify");
        }
        if options.clean {
            cmd.arg("--gc");
        }
        
        let start = Instant::now();
        let output = cmd.output().await?;
        
        Ok(BuildResult {
            success: output.status.success(),
            duration: start.elapsed(),
            output: String::from_utf8_lossy(&output.stdout).to_string(),
            errors: if !output.stderr.is_empty() {
                Some(String::from_utf8_lossy(&output.stderr).to_string())
            } else {
                None
            },
        })
    }
}
```

#### 5.3.3 主题管理模块

```rust
// services/theme_service.rs
pub struct ThemeService {
    cache_dir: PathBuf,
    http_client: reqwest::Client,
}

impl ThemeService {
    /// 从主题市场获取主题列表
    pub async fn fetch_themes(&self) -> Result<Vec<ThemeMetadata>> {
        let url = "https://themes.pineappleblog-editor.com/api/themes";
        let response = self.http_client
            .get(url)
            .send()
            .await?
            .json::<ThemesResponse>()
            .await?;
        
        Ok(response.themes)
    }
    
    /// 安装主题到项目
    pub async fn install_theme(
        &self,
        project: &Project,
        theme_id: &str,
    ) -> Result<()> {
        // 1. 下载主题到缓存
        let theme_path = self.download_theme(theme_id).await?;
        
        // 2. 复制到项目 themes 目录
        let target_path = project.path.join("themes").join(theme_id);
        fs_extra::dir::copy(theme_path, target_path, &CopyOptions::new())?;
        
        // 3. 更新项目配置
        self.update_project_config(project, theme_id).await?;
        
        Ok(())
    }
    
    /// 下载主题（带缓存）
    async fn download_theme(&self, theme_id: &str) -> Result<PathBuf> {
        let cache_path = self.cache_dir.join(theme_id);
        
        // 检查缓存
        if cache_path.exists() {
            return Ok(cache_path);
        }
        
        // 下载主题
        let url = format!("https://themes.pineappleblog-editor.com/download/{}", theme_id);
        let response = self.http_client.get(&url).send().await?;
        let bytes = response.bytes().await?;
        
        // 解压到缓存目录
        self.extract_theme(&bytes, &cache_path).await?;
        
        Ok(cache_path)
    }
}
```

---

## 6. 数据流设计

### 6.1 用户操作流程示例

#### 场景：创建新文章

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 点击「新建文章」
     ▼
┌─────────────────────────┐
│ EditorView.vue          │
│ - 显示文章表单          │
│ - 输入标题、分类等      │
└────┬────────────────────┘
     │ 提交表单
     ▼
┌─────────────────────────┐
│ editorStore.ts          │
│ - 验证表单数据          │
│ - 调用 Tauri 命令       │
└────┬────────────────────┘
     │ invoke('create_post', ...)
     ▼
┌─────────────────────────┐
│ Tauri IPC Bridge        │
│ - 序列化数据            │
│ - 进程间通信            │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ commands/project.rs     │
│ #[tauri::command]       │
│ create_post(...)        │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ EngineService           │
│ - 选择正确的引擎适配器  │
│ - 调用 hugo new post    │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ HugoAdapter             │
│ - 执行 CLI 命令         │
│ - 创建 Markdown 文件    │
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ File System             │
│ - 写入文件              │
│ - 返回文件路径          │
└────┬────────────────────┘
     │ Result<PathBuf>
     ▼
     返回前端，打开编辑器
```

### 6.2 实时预览数据流

```
┌────────────────┐
│ Monaco Editor  │ ─── onChange ───┐
└────────────────┘                 │
                                   ▼
                        ┌──────────────────┐
                        │ Debounce (300ms) │
                        └────────┬─────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Auto Save to File       │
                    │ invoke('save_file')     │
                    └────────┬────────────────┘
                             │
                             ▼
                    ┌─────────────────────────┐
                    │ Hugo Server (Watch Mode)│
                    │ 自动检测文件变化        │
                    └────────┬────────────────┘
                             │
                             ▼
                    ┌─────────────────────────┐
                    │ Rebuild Site            │
                    │ 增量构建                │
                    └────────┬────────────────┘
                             │
                             ▼
                    ┌─────────────────────────┐
                    │ WebSocket Push          │
                    │ LiveReload Script       │
                    └────────┬────────────────┘
                             │
                             ▼
                    ┌─────────────────────────┐
                    │ Browser Preview         │
                    │ 自动刷新页面            │
                    └─────────────────────────┘
```

### 6.3 部署流程数据流

```
User ─── 选择部署目标 ───┐
                        │
                        ▼
            ┌───────────────────────┐
            │ Deployment Wizard     │
            │ - GitHub Pages        │
            │ - Netlify             │
            │ - Vercel              │
            └───────┬───────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │ Build Site (Production)   │
        │ invoke('build_site')      │
        └───────┬───────────────────┘
                │
                ▼
    ┌───────────────────────────────┐
    │ Validate Build Output         │
    │ - 检查 public/ 目录           │
    │ - 验证 HTML/CSS/JS            │
    └───────┬───────────────────────┘
            │
            ▼
┌───────────────────────────────────┐
│ Deploy Service                    │
│ - GitHub: git push                │
│ - Netlify: API upload             │
│ - Vercel: API deploy              │
└───────┬───────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│ Show Deployment Status            │
│ - Progress bar                    │
│ - Logs streaming                  │
│ - Success URL                     │
└───────────────────────────────────┘
```

---

## 7. 安全性设计

### 7.1 威胁模型

| 威胁 | 风险等级 | 缓解措施 |
|------|---------|---------|
| **恶意主题代码执行** | 🔴 高 | 主题沙箱隔离、代码审查 |
| **敏感信息泄露** | 🟠 中 | Token 加密存储、内存清理 |
| **文件系统越权访问** | 🟠 中 | 路径验证、白名单机制 |
| **依赖供应链攻击** | 🟡 低 | 依赖锁定、定期审计 |
| **中间人攻击** | 🟡 低 | HTTPS 强制、证书固定 |

### 7.2 安全措施实现

#### 7.2.1 Token 加密存储

```rust
// utils/crypto.rs
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};
use keyring::Entry;

pub struct SecureStorage {
    service_name: String,
}

impl SecureStorage {
    /// 存储敏感信息到系统密钥链
    pub fn store_token(&self, key: &str, value: &str) -> Result<()> {
        let entry = Entry::new(&self.service_name, key)?;
        
        // 使用系统密钥链加密存储
        entry.set_password(value)?;
        
        Ok(())
    }
    
    /// 从系统密钥链读取
    pub fn retrieve_token(&self, key: &str) -> Result<String> {
        let entry = Entry::new(&self.service_name, key)?;
        let password = entry.get_password()?;
        Ok(password)
    }
    
    /// 删除存储的 Token
    pub fn delete_token(&self, key: &str) -> Result<()> {
        let entry = Entry::new(&self.service_name, key)?;
        entry.delete_password()?;
        Ok(())
    }
}
```

#### 7.2.2 路径验证

```rust
// utils/validator.rs
pub struct PathValidator {
    allowed_base_paths: Vec<PathBuf>,
}

impl PathValidator {
    /// 验证路径是否在允许的范围内
    pub fn validate_path(&self, path: &Path) -> Result<PathBuf> {
        let canonical = path.canonicalize()
            .map_err(|_| Error::InvalidPath)?;
        
        // 检查路径遍历攻击
        for base in &self.allowed_base_paths {
            if canonical.starts_with(base) {
                return Ok(canonical);
            }
        }
        
        Err(Error::PathNotAllowed)
    }
    
    /// 验证文件扩展名
    pub fn validate_extension(&self, path: &Path, allowed: &[&str]) -> Result<()> {
        let ext = path.extension()
            .and_then(|e| e.to_str())
            .ok_or(Error::InvalidExtension)?;
        
        if allowed.contains(&ext) {
            Ok(())
        } else {
            Err(Error::ExtensionNotAllowed)
        }
    }
}
```

#### 7.2.3 主题安全检查

```rust
// services/theme_service.rs
impl ThemeService {
    /// 验证主题安全性
    async fn validate_theme_security(&self, theme_path: &Path) -> Result<()> {
        // 1. 检查是否包含可执行文件
        self.check_executables(theme_path)?;
        
        // 2. 扫描恶意脚本
        self.scan_malicious_scripts(theme_path)?;
        
        // 3. 验证文件权限
        self.verify_permissions(theme_path)?;
        
        Ok(())
    }
    
    fn check_executables(&self, path: &Path) -> Result<()> {
        let dangerous_exts = [".exe", ".bat", ".sh", ".cmd", ".ps1"];
        
        for entry in WalkDir::new(path) {
            let entry = entry?;
            if let Some(ext) = entry.path().extension() {
                if dangerous_exts.contains(&ext.to_str().unwrap_or("")) {
                    return Err(Error::DangerousFileDetected);
                }
            }
        }
        Ok(())
    }
}
```

### 7.3 Tauri 安全配置

```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
      "dangerousDisableAssetCspModification": false,
      "freezePrototype": true,
      "assetProtocol": {
        "enable": true,
        "scope": ["$RESOURCE/**"]
      }
    },
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "scope": ["$APPDATA/**", "$DOCUMENT/**"]
      },
      "shell": {
        "all": false,
        "execute": true,
        "sidecar": true,
        "scope": [
          {
            "name": "hugo",
            "cmd": "hugo",
            "args": true
          },
          {
            "name": "zola",
            "cmd": "zola",
            "args": true
          }
        ]
      },
      "http": {
        "all": false,
        "request": true,
        "scope": [
          "https://api.github.com/**",
          "https://api.netlify.com/**",
          "https://themes.pineappleblog-editor.com/**"
        ]
      }
    }
  }
}
```

---

## 8. 性能优化策略

### 8.1 启动性能

| 优化项 | 实现方案 | 预期效果 |
|--------|---------|----------|
| **懒加载路由** | Vue Router 动态导入 | 减少初始包体积 50% |
| **代码分割** | Vite 自动分割 | 首屏加载 < 2s |
| **资源预加载** | `<link rel="prefetch">` | 减少页面切换延迟 |
| **虚拟滚动** | vue-virtual-scroller | 文章列表渲染提速 10x |

```typescript
// router/index.ts
const routes = [
  {
    path: '/editor',
    component: () => import('@/views/EditorView.vue'), // 懒加载
    meta: { preload: true }
  }
]

// 预加载关键路由
router.beforeEach((to, from, next) => {
  if (to.meta.preload) {
    // 预加载下一个可能访问的路由
    router.getRoutes()
      .filter(r => r.meta.preloadAfter === to.name)
      .forEach(r => r.component)
  }
  next()
})
```

### 8.2 编辑器性能

```typescript
// composables/useEditor.ts
import { debounce } from 'lodash-es'

export function useEditor() {
  const content = ref('')
  const editor = ref<monaco.editor.IStandaloneCodeEditor>()
  
  // 防抖保存（300ms）
  const debouncedSave = debounce(async (value: string) => {
    await invoke('save_file', { content: value })
  }, 300)
  
  // 增量更新
  const onContentChange = (value: string) => {
    content.value = value
    debouncedSave(value)
  }
  
  // 使用 Web Worker 进行语法高亮
  const highlightWorker = new Worker(
    new URL('../workers/highlight.worker.ts', import.meta.url),
    { type: 'module' }
  )
  
  return {
    content,
    editor,
    onContentChange
  }
}
```

### 8.3 构建性能

```rust
// services/engine_service.rs
impl EngineService {
    /// 增量构建（仅构建变更文件）
    pub async fn incremental_build(
        &self,
        project: &Project,
        changed_files: Vec<PathBuf>
    ) -> Result<BuildResult> {
        // 1. 分析依赖图
        let affected = self.analyze_dependencies(project, &changed_files)?;
        
        // 2. 仅重建受影响的页面
        let result = match project.engine {
            EngineType::Hugo => {
                self.hugo_adapter.partial_build(project, &affected).await?
            }
            EngineType::Zola => {
                self.zola_adapter.partial_build(project, &affected).await?
            }
        };
        
        Ok(result)
    }
}
```

### 8.4 内存优化

```rust
// 使用对象池减少分配
use pool::Pool;

pub struct ProcessPool {
    pool: Pool<HugoProcess>,
}

impl ProcessPool {
    pub fn new(size: usize) -> Self {
        let pool = Pool::new(size, || HugoProcess::new());
        Self { pool }
    }
    
    pub async fn execute(&self, cmd: Command) -> Result<Output> {
        let mut process = self.pool.get().await;
        let output = process.run(cmd).await?;
        // process 自动归还到池中
        Ok(output)
    }
}
```

---

## 9. 扩展性设计

### 9.1 插件系统架构

```rust
// plugins/mod.rs
pub trait Plugin: Send + Sync {
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    
    /// 插件初始化
    fn init(&mut self, ctx: &mut PluginContext) -> Result<()>;
    
    /// 处理事件
    fn on_event(&self, event: &Event) -> Result<()>;
    
    /// 注册命令
    fn commands(&self) -> Vec<PluginCommand>;
}

// 插件管理器
pub struct PluginManager {
    plugins: HashMap<String, Box<dyn Plugin>>,
}

impl PluginManager {
    pub fn load_plugin(&mut self, path: &Path) -> Result<()> {
        // 动态加载插件（使用 libloading）
        unsafe {
            let lib = Library::new(path)?;
            let create_plugin: Symbol<fn() -> Box<dyn Plugin>> = 
                lib.get(b"create_plugin")?;
            
            let plugin = create_plugin();
            self.plugins.insert(plugin.name().to_string(), plugin);
        }
        Ok(())
    }
}
```

### 9.2 事件系统

```rust
// events/mod.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AppEvent {
    ProjectCreated(Project),
    FileChanged(PathBuf),
    BuildStarted(String),
    BuildCompleted(BuildResult),
    ThemeInstalled(String),
}

pub struct EventBus {
    subscribers: Arc<RwLock<HashMap<String, Vec<EventHandler>>>>,
}

impl EventBus {
    pub fn subscribe<F>(&self, event_type: &str, handler: F)
    where
        F: Fn(&AppEvent) + Send + Sync + 'static
    {
        let mut subs = self.subscribers.write().unwrap();
        subs.entry(event_type.to_string())
            .or_insert_vec()
            .push(Box::new(handler));
    }
    
    pub fn publish(&self, event: AppEvent) {
        let subs = self.subscribers.read().unwrap();
        if let Some(handlers) = subs.get(&event.event_type()) {
            for handler in handlers {
                handler(&event);
            }
        }
    }
}
```

### 9.3 多语言支持（i18n）

```typescript
// i18n/index.ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': () => import('./locales/zh-CN.json'),
    'en': () => import('./locales/en.json'),
    'ja': () => import('./locales/ja.json'),
  }
})

// 自动检测系统语言
const detectLocale = async () => {
  const systemLocale = await invoke<string>('get_system_locale')
  i18n.global.locale.value = systemLocale
}
```

### 9.4 主题 API 扩展

```typescript
// theme-api.d.ts
declare module '@pineappleblog-editor/theme-api' {
  interface ThemeAPI {
    // 获取项目配置
    getConfig(): Promise<ProjectConfig>
    
    // 修改配置
    setConfig(key: string, value: any): Promise<void>
    
    // 注册自定义命令
    registerCommand(id: string, handler: () => void): void
    
    // 显示通知
    showNotification(message: string, type: 'info' | 'success' | 'error'): void
    
    // 访问文件系统
    fs: {
      readFile(path: string): Promise<string>
      writeFile(path: string, content: string): Promise<void>
    }
  }
  
  export const themeAPI: ThemeAPI
}
```

---

## 10. 部署架构

### 10.1 应用分发策略

```yaml
Platforms:
  Windows:
    - Installer: NSIS (.exe)
    - Portable: .zip
    - Package Manager: winget, chocolatey
    
  macOS:
    - Disk Image: .dmg
    - Package Manager: homebrew
    - Auto-update: Sparkle framework
    
  Linux:
    - Debian/Ubuntu: .deb
    - RedHat/Fedora: .rpm
    - Arch: AUR package
    - Universal: AppImage

Distribution Channels:
  - GitHub Releases (primary)
  - Official Website
  - Package Managers
  - App Stores (future)
```

### 10.2 自动更新机制

```rust
// updater/mod.rs
use tauri::updater::{builder, UpdateResponse};

pub struct AppUpdater {
    current_version: String,
    update_url: String,
}

impl AppUpdater {
    pub async fn check_update(&self) -> Result<Option<UpdateInfo>> {
        let update = builder()
            .current_version(&self.current_version)
            .url(&self.update_url)
            .build()?
            .check()
            .await?;
        
        if update.is_update_available() {
            Ok(Some(UpdateInfo {
                version: update.latest_version().to_string(),
                notes: update.body().unwrap_or("").to_string(),
                download_url: update.download_url().to_string(),
            }))
        } else {
            Ok(None)
        }
    }
    
    pub async fn install_update(&self, update: UpdateInfo) -> Result<()> {
        // 下载更新包
        let response = reqwest::get(&update.download_url).await?;
        let bytes = response.bytes().await?;
        
        // 验证签名
        self.verify_signature(&bytes, &update.signature)?;
        
        // 安装更新（重启应用）
        std::process::Command::new("installer")
            .arg("--install")
            .spawn()?;
        
        Ok(())
    }
}
```

### 10.3 崩溃报告

```rust
// error/crash_reporter.rs
use sentry;

pub fn init_crash_reporting() {
    let _guard = sentry::init(sentry::ClientOptions {
        dsn: Some("https://your-dsn@sentry.io/project".parse().unwrap()),
        release: Some(env!("CARGO_PKG_VERSION").into()),
        environment: Some("production".into()),
        before_send: Some(Arc::new(|event| {
            // 过滤敏感信息
            filter_sensitive_data(event)
        })),
        ..Default::default()
    });
}

fn filter_sensitive_data(mut event: Event) -> Option<Event> {
    // 移除用户路径
    if let Some(exc) = event.exception.as_mut() {
        for value in &mut exc.values {
            if let Some(stacktrace) = &mut value.stacktrace {
                for frame in &mut stacktrace.frames {
                    frame.filename = frame.filename
                        .as_ref()
                        .map(|f| sanitize_path(f));
                }
            }
        }
    }
    Some(event)
}
```

---

## 11. 测试策略

### 11.1 测试金字塔

```
         /\
        /  \  E2E Tests (10%)
       /____\
      /      \
     / Integration \ (30%)
    /    Tests     \
   /______________\
  /                \
 /   Unit Tests     \ (60%)
/____________________\
```

### 11.2 单元测试

```rust
// tests/services/project_service_test.rs
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_create_project() {
        // Arrange
        let service = ProjectService::new_mock();
        let name = "test-blog".to_string();
        let path = PathBuf::from("/tmp/test-blog");
        
        // Act
        let result = service.create_project(name, path, EngineType::Hugo).await;
        
        // Assert
        assert!(result.is_ok());
        let project = result.unwrap();
        assert_eq!(project.name, "test-blog");
        assert_eq!(project.engine, EngineType::Hugo);
    }
    
    #[tokio::test]
    async fn test_create_project_invalid_path() {
        let service = ProjectService::new_mock();
        let result = service.create_project(
            "test".to_string(),
            PathBuf::from("/invalid/../path"),
            EngineType::Hugo
        ).await;
        
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), Error::InvalidPath);
    }
}
```

```typescript
// tests/unit/composables/useProject.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { useProject } from '@/composables/useProject'

describe('useProject', () => {
  it('should create project successfully', async () => {
    // Mock Tauri invoke
    vi.mock('@tauri-apps/api/tauri', () => ({
      invoke: vi.fn().mockResolvedValue({
        id: '123',
        name: 'test-blog'
      })
    }))
    
    const { createProject } = useProject()
    const result = await createProject('test-blog', '/path', 'hugo')
    
    expect(result.success).toBe(true)
    expect(result.data.name).toBe('test-blog')
  })
})
```

### 11.3 集成测试

```rust
// tests/integration/engine_test.rs
#[tokio::test]
async fn test_hugo_build_flow() {
    // 创建临时项目
    let temp_dir = TempDir::new().unwrap();
    let project_path = temp_dir.path();
    
    // 初始化 Hugo 项目
    let adapter = HugoAdapter::new();
    adapter.init(project_path, &EngineConfig::default()).await.unwrap();
    
    // 创建文章
    adapter.new_post(project_path, "test-post").await.unwrap();
    
    // 构建站点
    let result = adapter.build(project_path, &BuildOptions::default()).await.unwrap();
    
    assert!(result.success);
    assert!(project_path.join("public/index.html").exists());
}
```

### 11.4 E2E 测试

```typescript
// tests/e2e/create-project.spec.ts
import { test, expect } from '@playwright/test'

test('complete project creation flow', async ({ page }) => {
  // 启动应用
  await page.goto('tauri://localhost')
  
  // 点击新建项目
  await page.click('button:has-text("新建项目")')
  
  // 填写表单
  await page.fill('input[name="projectName"]', 'My Blog')
  await page.selectOption('select[name="engine"]', 'hugo')
  await page.selectOption('select[name="theme"]', 'butterfly')
  
  // 提交
  await page.click('button:has-text("创建")')
  
  // 验证跳转到编辑器
  await expect(page).toHaveURL(/\/editor/)
  
  // 验证项目已创建
  await expect(page.locator('.project-name')).toHaveText('My Blog')
})
```

### 11.5 性能测试

```typescript
// tests/performance/editor-performance.spec.ts
import { test, expect } from '@playwright/test'

test('editor input should be responsive', async ({ page }) => {
  await page.goto('tauri://localhost/editor')
  
  const editor = page.locator('.monaco-editor')
  
  // 测试输入延迟
  const startTime = Date.now()
  await editor.type('a'.repeat(1000))
  const endTime = Date.now()
  
  // 应该在 500ms 内完成
  expect(endTime - startTime).toBeLessThan(500)
  
  // 测试内存占用
  const metrics = await page.evaluate(() => {
    return (performance as any).memory
  })
  
  expect(metrics.usedJSHeapSize).toBeLessThan(200 * 1024 * 1024) // < 200MB
})
```

---

## 12. 技术债务与风险

### 12.1 已知技术债务

| 债务项 | 严重性 | 影响 | 计划修复版本 |
|--------|--------|------|-------------|
| **Hugo/Zola 版本硬编码** | 🟠 中 | 无法跟进最新版本 | v1.2.0 |
| **缺少数据库迁移机制** | 🟡 低 | 升级时配置丢失风险 | v1.1.0 |
| **前端状态管理过于复杂** | 🟡 低 | 维护成本高 | v2.0.0 |
| **错误处理不统一** | 🟠 中 | 用户体验不一致 | v1.1.0 |

### 12.2 技术风险

#### 风险 1: Tauri 生态不成熟

- **概率**：中
- **影响**：高
- **缓解措施**：
  - 保持 Tauri 核心功能的抽象层
  - 关键功能准备 Electron 降级方案
  - 积极参与社区，提前发现问题

#### 风险 2: Hugo/Zola Breaking Changes

- **概率**：低
- **影响**：高
- **缓解措施**：
  - 版本锁定，延迟升级
  - 完整的集成测试覆盖
  - 提供多版本引擎切换

#### 风险 3: 主题兼容性问题

- **概率**：高
- **影响**：中
- **缓解措施**：
  - 主题 API 版本化
  - 主题兼容性测试套件
  - 降级到默认主题机制

### 12.3 性能瓶颈

| 瓶颈 | 现状 | 优化目标 | 优化方案 |
|------|------|----------|----------|
| 大文件编辑 | > 10MB 卡顿 | 支持 100MB | 虚拟渲染 + 流式加载 |
| 主题切换 | 5-10s | < 2s | 增量应用 + 预加载 |
| 构建速度 | 1000 页/min | 5000 页/min | 并行构建 + 缓存 |

---

## 13. 未来演进方向

### 13.1 短期（v1.x）

- ✅ 完善核心功能
- ✅ 稳定性提升
- 🔄 插件系统 Alpha
- 🔄 Git 集成
- 🔄 AI 写作助手

### 13.2 中期（v2.x）

- 协作编辑（WebRTC）
- 移动端伴侣应用
- 云端同步
- 模板市场
- 更多 SSG 引擎支持（Jekyll、Hexo）

### 13.3 长期（v3.x）

- Web 版本（WASM）
- 企业版（团队管理）
- 国际化完整支持
- 低代码主题编辑器
- AI 主题生成

---

## 14. 附录

### 14.1 术语表

| 术语 | 定义 |
|------|------|
| **SSG** | Static Site Generator，静态站点生成器 |
| **Front Matter** | Markdown 文件顶部的元数据区域 |
| **IPC** | Inter-Process Communication，进程间通信 |
| **WASM** | WebAssembly，Web 汇编语言 |

### 14.2 参考资料

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Hugo Documentation](https://gohugo.io/documentation/)
- [Zola Documentation](https://www.getzola.org/documentation/)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Rust Book](https://doc.rust-lang.org/book/)

### 14.3 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2025-11-17 | 初版完成 |

---

<div align="center">

**Reviewed by**: Architecture Team  
**Approved by**: Tech Lead  
**Next Review**: 2025-12-17

</div>