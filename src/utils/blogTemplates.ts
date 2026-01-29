/**
 * Hugo 博客模板生成器
 * 为不同主题生成完整的博客项目结构
 */

import type { HugoTheme } from './themeConfig'

// 博客配置接口
export interface BlogConfig {
  title: string
  description: string
  author: string
  baseURL: string
  language: string
  theme: HugoTheme
}

// 文件模板接口
interface FileTemplate {
  path: string
  content: string
}

/**
 * 生成 Hugo 博客的基础配置文件
 */
function generateHugoConfig(config: BlogConfig): string {
  const themeMapping: Record<HugoTheme, string> = {
    stack: 'hugo-theme-stack',
    papermod: 'PaperMod',
    loveit: 'LoveIt',
    blowfish: 'blowfish',
    congo: 'congo',
    docsy: 'docsy',
    default: '',
  }

  const themeName = themeMapping[config.theme] || ''

  // 使用 YAML 格式，更易读
  return `baseURL: "${config.baseURL}"
languageCode: "${config.language}"
title: "${config.title}"
theme: "${themeName}"

# 构建配置
buildDrafts: false
buildFuture: false
buildExpired: false

# 启用机器人索引
enableRobotsTXT: true

# 分页设置
paginate: 10

# 启用 emoji
enableEmoji: true

# 语法高亮
pygmentsUseClasses: true

markup:
  highlight:
    noClasses: false
    codeFences: true
    guessSyntax: true
    lineNos: false
    style: monokai
  goldmark:
    renderer:
      unsafe: true

# 作者信息
params:
  author: "${config.author}"
  description: "${config.description}"
  
# 菜单配置
menu:
  main:
    - identifier: posts
      name: 📝 文章
      url: /posts/
      weight: 10
    - identifier: categories
      name: 📁 分类
      url: /categories/
      weight: 20
    - identifier: tags
      name: 🏷️ 标签
      url: /tags/
      weight: 30
    - identifier: about
      name: 👤 关于
      url: /about/
      weight: 40
`
}

/**
 * 生成 Stack 主题特定的配置
 */
function generateStackConfig(config: BlogConfig): FileTemplate[] {
  const hugoConfig = `baseURL: "${config.baseURL}"
languageCode: "${config.language}"
title: "${config.title}"
theme: "hugo-theme-stack"

pagination:
  pagerSize: 10

enableRobotsTXT: true
enableEmoji: true

params:
  mainSections:
    - posts
  featuredImageField: image
  rssFullContent: true
  favicon: /favicon.ico
  
  footer:
    since: 2024
    customText: ""
  
  dateFormat:
    published: "2006-01-02"
    lastUpdated: "2006-01-02 15:04"
  
  sidebar:
    emoji: "🍍"
    subtitle: "${config.description}"
    avatar:
      enabled: true
      local: true
      src: "img/avatar.png"
  
  article:
    math: false
    toc: true
    readingTime: true
    license:
      enabled: true
      default: "CC BY-NC-SA 4.0"
  
  comments:
    enabled: false
  
  widgets:
    homepage:
      - type: search
      - type: archives
        params:
          limit: 5
      - type: categories
        params:
          limit: 10
      - type: tag-cloud
        params:
          limit: 20
    page:
      - type: toc

menu:
  main:
    - identifier: home
      name: 首页
      url: /
      weight: -100
      params:
        icon: home
        newTab: false
  social:
    - identifier: github
      name: GitHub
      url: https://github.com/
      params:
        icon: brand-github

markup:
  goldmark:
    renderer:
      unsafe: true
  highlight:
    noClasses: false
    codeFences: true
    guessSyntax: true
    lineNoStart: 1
    lineNos: false
    style: monokai
`

  const indexContent = `---
title: "首页"
---
欢迎来到我的博客！
`

  const aboutContent = `---
title: "关于我"
date: ${new Date().toISOString()}
layout: "about"
slug: "about"
menu:
  main:
    weight: -90
    params:
      icon: user
---

## 👋 你好！

这是一个关于我的页面。你可以在这里介绍自己。

## 联系方式

- Email: your@email.com
- GitHub: [YourUsername](https://github.com/)
`

  const archivesContent = `---
title: "归档"
date: ${new Date().toISOString()}
layout: "archives"
slug: "archives"
menu:
  main:
    weight: 40
    params:
      icon: archives
---
`

  const searchContent = `---
title: "搜索"
slug: "search"
layout: "search"
outputs:
  - html
  - json
---
`

  const samplePost = `---
title: "我的第一篇文章"
date: ${new Date().toISOString()}
draft: false
description: "这是我的第一篇博客文章"
image: ""
categories:
  - 技术
tags:
  - Hugo
  - 博客
---

## 欢迎

这是使用 **Hugo Stack** 主题创建的第一篇文章。

## 特点

- 📚 支持系列文章
- 🔍 内置搜索
- 📑 目录导航
- 💬 评论系统

## 代码示例

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## 图片

你可以在文章中添加图片，支持图片画廊功能。

---

感谢阅读！
`

  return [
    { path: 'hugo.yaml', content: hugoConfig },
    { path: 'content/_index.md', content: indexContent },
    { path: 'content/page/about/index.md', content: aboutContent },
    { path: 'content/page/archives/index.md', content: archivesContent },
    { path: 'content/page/search/index.md', content: searchContent },
    { path: 'content/posts/first-post/index.md', content: samplePost },
    { path: 'content/categories/_index.md', content: '---\ntitle: "分类"\n---\n' },
    { path: 'content/tags/_index.md', content: '---\ntitle: "标签"\n---\n' },
    { path: 'assets/img/.gitkeep', content: '' },
    { path: 'static/favicon.ico', content: '' },
  ]
}

/**
 * 生成 PaperMod 主题特定的配置
 */
function generatePaperModConfig(config: BlogConfig): FileTemplate[] {
  const hugoConfig = `baseURL: "${config.baseURL}"
languageCode: "${config.language}"
title: "${config.title}"
theme: "PaperMod"

pagination:
  pagerSize: 5

enableRobotsTXT: true
buildDrafts: false
buildFuture: false
buildExpired: false

minify:
  disableXML: true
  minifyOutput: true

params:
  env: production
  title: "${config.title}"
  description: "${config.description}"
  keywords: [博客, Hugo, PaperMod]
  author: "${config.author}"
  DateFormat: "2006年1月2日"
  defaultTheme: auto
  disableThemeToggle: false
  
  ShowReadingTime: true
  ShowShareButtons: true
  ShowPostNavLinks: true
  ShowBreadCrumbs: true
  ShowCodeCopyButtons: true
  ShowWordCount: true
  ShowRssButtonInSectionTermList: true
  UseHugoToc: true
  disableSpecial1stPost: false
  disableScrollToTop: false
  comments: false
  hidemeta: false
  hideSummary: false
  showtoc: true
  tocopen: false
  
  homeInfoParams:
    Title: "👋 欢迎来到我的博客"
    Content: "${config.description}"
  
  socialIcons:
    - name: github
      url: "https://github.com/"
    - name: rss
      url: "index.xml"
  
  cover:
    hidden: false
    hiddenInList: false
    hiddenInSingle: false
  
  fuseOpts:
    isCaseSensitive: false
    shouldSort: true
    location: 0
    distance: 1000
    threshold: 0.4
    minMatchCharLength: 0
    keys: ["title", "permalink", "summary", "content"]

menu:
  main:
    - identifier: posts
      name: 📝 文章
      url: /posts/
      weight: 10
    - identifier: categories
      name: 📁 分类
      url: /categories/
      weight: 20
    - identifier: tags
      name: 🏷️ 标签
      url: /tags/
      weight: 30
    - identifier: archives
      name: 📚 归档
      url: /archives/
      weight: 40
    - identifier: search
      name: 🔍 搜索
      url: /search/
      weight: 50

outputs:
  home:
    - HTML
    - RSS
    - JSON

markup:
  highlight:
    noClasses: false
    codeFences: true
    guessSyntax: true
    style: monokai
`

  const archivesContent = `---
title: "归档"
layout: "archives"
url: "/archives/"
summary: "所有文章"
---
`

  const searchContent = `---
title: "搜索"
layout: "search"
placeholder: "搜索文章..."
---
`

  const samplePost = `---
title: "我的第一篇文章"
date: ${new Date().toISOString()}
draft: false
author: "${config.author}"
description: "这是我的第一篇博客文章"
summary: "欢迎来到我的博客！这是使用 PaperMod 主题创建的第一篇文章。"
categories:
  - 技术
tags:
  - Hugo
  - 博客
ShowToc: true
TocOpen: false
ShowReadingTime: true
ShowBreadCrumbs: true
---

## 欢迎

这是使用 **Hugo PaperMod** 主题创建的第一篇文章。

## 特点

PaperMod 是一个简洁优雅的 Hugo 主题：

- 🎨 简洁的设计
- 🌙 暗色/亮色模式切换
- 🔍 内置搜索
- 📱 响应式布局

## 代码示例

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

## 引用

> 简单就是终极的复杂。 — 达芬奇

---

感谢阅读！
`

  return [
    { path: 'hugo.yaml', content: hugoConfig },
    { path: 'content/_index.md', content: '---\ntitle: "首页"\n---\n' },
    { path: 'content/archives.md', content: archivesContent },
    { path: 'content/search.md', content: searchContent },
    { path: 'content/posts/_index.md', content: '---\ntitle: "文章"\n---\n' },
    { path: 'content/posts/first-post.md', content: samplePost },
    { path: 'content/categories/_index.md', content: '---\ntitle: "分类"\n---\n' },
    { path: 'content/tags/_index.md', content: '---\ntitle: "标签"\n---\n' },
    { path: 'static/favicon.ico', content: '' },
  ]
}

/**
 * 生成 LoveIt 主题特定的配置
 */
function generateLoveItConfig(config: BlogConfig): FileTemplate[] {
  const hugoConfig = `baseURL: "${config.baseURL}"
languageCode: "${config.language}"
title: "${config.title}"
theme: "LoveIt"

pagination:
  pagerSize: 10

enableRobotsTXT: true
enableEmoji: true

params:
  version: "0.2.X"
  title: "${config.title}"
  description: "${config.description}"
  keywords: ["博客", "Hugo", "LoveIt"]
  defaultTheme: auto
  
  author:
    name: "${config.author}"
  
  home:
    rss: 10
    profile:
      enable: true
      title: "${config.author}"
      subtitle: "${config.description}"
      typeit: true
    posts:
      enable: true
      paginate: 6
  
  header:
    desktopMode: fixed
    mobileMode: auto
  
  footer:
    enable: true
    hugo: true
    copyright: true
    author: true
    since: 2024
  
  section:
    paginate: 20
    dateFormat: "2006-01-02"
    rss: 10
  
  list:
    paginate: 20
    dateFormat: "2006-01-02"
    rss: 10
  
  page:
    hiddenFromHomePage: false
    hiddenFromSearch: false
    twemoji: false
    lightgallery: true
    ruby: true
    fraction: true
    fontawesome: true
    linkToMarkdown: true
    rssFullText: false
    toc:
      enable: true
      auto: true
    code:
      copy: true
      maxShownLines: 50
    share:
      enable: true
    comment:
      enable: false
  
  search:
    enable: true
    type: "fuse"
    contentLength: 4000
    placeholder: "搜索文章标题或内容..."
    maxResultLength: 10
    snippetLength: 50
    highlightTag: "em"
    absoluteURL: false
    fuse:
      isCaseSensitive: false
      minMatchCharLength: 2
      findAllMatches: false
      location: 0
      threshold: 0.3
      distance: 100
      ignoreLocation: false
      useExtendedSearch: false
      ignoreFieldNorm: false

menu:
  main:
    - identifier: posts
      name: 文章
      url: /posts/
      weight: 1
    - identifier: categories
      name: 分类
      url: /categories/
      weight: 2
    - identifier: tags
      name: 标签
      url: /tags/
      weight: 3
    - identifier: about
      name: 关于
      url: /about/
      weight: 4

outputs:
  home:
    - HTML
    - RSS
    - JSON

markup:
  highlight:
    codeFences: true
    guessSyntax: true
    lineNos: true
    style: monokai
  goldmark:
    renderer:
      unsafe: true
`

  const aboutContent = `---
title: "关于我"
date: ${new Date().toISOString()}
draft: false
---

## 👋 你好！

欢迎来到我的博客！

## 关于这个网站

这个网站使用 Hugo 和 LoveIt 主题构建。
`

  const samplePost = `---
title: "我的第一篇文章"
subtitle: "使用 LoveIt 主题开始我的博客之旅"
date: ${new Date().toISOString()}
lastmod: ${new Date().toISOString()}
draft: false
author: "${config.author}"
description: "这是我的第一篇博客文章"
featuredImage: ""
categories:
  - 技术
tags:
  - Hugo
  - 博客
toc: true
math: false
lightgallery: true
---

## 欢迎

这是使用 **Hugo LoveIt** 主题创建的第一篇文章。

<!--more-->

## 特点

LoveIt 是一个功能丰富的 Hugo 主题：

- ❤️ 美观的设计
- 🔍 全文搜索
- 📊 阅读统计
- 🌈 代码高亮

## 代码示例

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, LoveIt!")
}
\`\`\`

## 数学公式

LoveIt 支持数学公式渲染。

## 图片画廊

LoveIt 支持图片画廊功能，可以点击放大查看图片。

---

感谢阅读！
`

  return [
    { path: 'hugo.yaml', content: hugoConfig },
    { path: 'content/_index.md', content: '---\ntitle: "首页"\n---\n' },
    { path: 'content/about/index.md', content: aboutContent },
    { path: 'content/posts/_index.md', content: '---\ntitle: "文章"\n---\n' },
    { path: 'content/posts/first-post/index.md', content: samplePost },
    { path: 'content/categories/_index.md', content: '---\ntitle: "分类"\n---\n' },
    { path: 'content/tags/_index.md', content: '---\ntitle: "标签"\n---\n' },
    { path: 'static/favicon.ico', content: '' },
    { path: 'assets/.gitkeep', content: '' },
  ]
}

/**
 * 生成 Blowfish 主题特定的配置
 */
function generateBlowfishConfig(config: BlogConfig): FileTemplate[] {
  // Blowfish 使用 TOML 分离配置文件
  const hugoConfig = `baseURL = "${config.baseURL}"
languageCode = "${config.language}"
title = "${config.title}"
theme = "blowfish"

enableRobotsTXT = true
enableEmoji = true

[pagination]
pagerSize = 10
`

  const languagesConfig = `[${config.language}]
languageCode = "${config.language}"
languageName = "中文"
weight = 1
title = "${config.title}"

[${config.language}.params]
displayName = "中文"
isoCode = "${config.language}"
dateFormat = "2006年1月2日"

[${config.language}.params.author]
name = "${config.author}"
image = "img/author.jpg"
headline = "${config.description}"
bio = "欢迎来到我的博客"
links = [
  { github = "https://github.com/" },
]
`

  const paramsConfig = `colorScheme = "blowfish"
defaultAppearance = "dark"
autoSwitchAppearance = true

enableSearch = true
enableCodeCopy = true

mainSections = ["posts"]

[header]
layout = "basic"

[footer]
showMenu = true
showCopyright = true
showThemeAttribution = true
showAppearanceSwitcher = true
showScrollToTop = true

[homepage]
layout = "profile"
homepageImage = "img/background.jpg"
showRecent = true
showRecentItems = 5
showMoreLink = true
showMoreLinkDest = "/posts"

[article]
showDate = true
showDateOnlyInArticle = false
showDateUpdated = false
showAuthor = true
showHero = false
showBreadcrumbs = true
showDraftLabel = true
showEdit = false
showHeadingAnchors = true
showPagination = true
invertPagination = false
showReadingTime = true
showTableOfContents = true
showRelatedContent = false
showTaxonomies = true
showAuthorsBadges = false
showWordCount = true
showSummary = true

[list]
showHero = false
showBreadcrumbs = false
showSummary = false
showTableOfContents = false
groupByYear = true

[sitemap]
excludedKinds = []

[taxonomy]
showTermCount = true

[fathomAnalytics]
# site = "ABC12345"

[verification]
# google = ""
# bing = ""
# pinterest = ""
# yandex = ""
`

  const menusConfig = `[[main]]
name = "文章"
pageRef = "posts"
weight = 10

[[main]]
name = "分类"
pageRef = "categories"
weight = 20

[[main]]
name = "标签"
pageRef = "tags"
weight = 30

[[main]]
name = "关于"
pageRef = "about"
weight = 40

[[footer]]
name = "标签"
pageRef = "tags"
weight = 10
`

  const markupConfig = `[goldmark]
[goldmark.renderer]
unsafe = true

[highlight]
noClasses = false
`

  const indexContent = `---
title: "欢迎来到我的博客"
description: "${config.description}"
---

这是我的博客首页内容。
`

  const aboutContent = `---
title: "关于我"
date: ${new Date().toISOString()}
draft: false
showDate: false
showAuthor: true
showReadingTime: false
showEdit: false
---

## 👋 你好！

欢迎来到我的博客！这里记录着我的技术探索和生活感悟。

## 联系方式

- GitHub: [YourUsername](https://github.com/)
`

  const samplePost = `---
title: "我的第一篇文章"
date: ${new Date().toISOString()}
draft: false
description: "这是我的第一篇博客文章"
summary: "欢迎来到我的博客！"
categories:
  - 技术
tags:
  - Hugo
  - 博客
showTableOfContents: true
---

## 欢迎

这是使用 **Hugo Blowfish** 主题创建的第一篇文章。

## 特点

Blowfish 是一个现代化的 Hugo 主题：

- 🐡 独特的设计风格
- 🎨 多种配色方案
- 📱 响应式布局
- 🔍 内置搜索

## 代码示例

\`\`\`typescript
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

---

感谢阅读！
`

  return [
    { path: 'hugo.toml', content: hugoConfig },
    { path: 'config/_default/languages.toml', content: languagesConfig },
    { path: 'config/_default/params.toml', content: paramsConfig },
    { path: 'config/_default/menus.toml', content: menusConfig },
    { path: 'config/_default/markup.toml', content: markupConfig },
    { path: 'content/_index.md', content: indexContent },
    { path: 'content/about/index.md', content: aboutContent },
    { path: 'content/posts/_index.md', content: '---\ntitle: "文章"\n---\n' },
    { path: 'content/posts/first-post/index.md', content: samplePost },
    { path: 'content/categories/_index.md', content: '---\ntitle: "分类"\n---\n' },
    { path: 'content/tags/_index.md', content: '---\ntitle: "标签"\n---\n' },
    { path: 'assets/img/.gitkeep', content: '' },
    { path: 'static/favicon.ico', content: '' },
  ]
}

/**
 * 生成 Congo 主题特定的配置
 */
function generateCongoConfig(config: BlogConfig): FileTemplate[] {
  const hugoConfig = `baseURL = "${config.baseURL}"
languageCode = "${config.language}"
title = "${config.title}"
theme = "congo"

enableRobotsTXT = true
enableEmoji = true

[pagination]
pagerSize = 10
`

  const paramsConfig = `colorScheme = "congo"
defaultAppearance = "dark"
autoSwitchAppearance = true

enableSearch = true
enableCodeCopy = true
enableImageLazyLoading = true

mainSections = ["posts"]
description = "${config.description}"

[author]
name = "${config.author}"
image = "img/author.jpg"
headline = "${config.description}"
bio = "技术博客"
links = [
  { github = "https://github.com/" },
]

[header]
layout = "basic"

[footer]
showCopyright = true
showThemeAttribution = true
showAppearanceSwitcher = true
showScrollToTop = true

[homepage]
layout = "page"
showRecent = true
recentLimit = 5

[article]
showDate = true
showAuthor = true
showBreadcrumbs = true
showDraftLabel = true
showEdit = false
showHeadingAnchors = true
showPagination = true
showReadingTime = true
showTableOfContents = true
showTaxonomies = true
showWordCount = true

[list]
showBreadcrumbs = false
showSummary = true
showTableOfContents = false
groupByYear = true

[taxonomy]
showTermCount = true
`

  const menusConfig = `[[main]]
name = "文章"
pageRef = "posts"
weight = 10

[[main]]
name = "分类"
pageRef = "categories"
weight = 20

[[main]]
name = "标签"
pageRef = "tags"
weight = 30
`

  const indexContent = `---
title: "欢迎"
description: "${config.description}"
---

欢迎来到我的博客！
`

  const samplePost = `---
title: "我的第一篇文章"
date: ${new Date().toISOString()}
draft: false
description: "这是我的第一篇博客文章"
summary: "欢迎来到我的博客！"
categories:
  - 技术
tags:
  - Hugo
  - 博客
showTableOfContents: true
---

## 欢迎

这是使用 **Hugo Congo** 主题创建的第一篇文章。

## 特点

- 🌴 简洁优雅
- 🎨 多种配色
- 📱 响应式设计
- 🔍 搜索功能

## 代码示例

\`\`\`bash
hugo server -D
\`\`\`

---

感谢阅读！
`

  return [
    { path: 'hugo.toml', content: hugoConfig },
    { path: 'config/_default/params.toml', content: paramsConfig },
    { path: 'config/_default/menus.toml', content: menusConfig },
    { path: 'content/_index.md', content: indexContent },
    { path: 'content/posts/_index.md', content: '---\ntitle: "文章"\n---\n' },
    { path: 'content/posts/first-post.md', content: samplePost },
    { path: 'content/categories/_index.md', content: '---\ntitle: "分类"\n---\n' },
    { path: 'content/tags/_index.md', content: '---\ntitle: "标签"\n---\n' },
    { path: 'assets/img/.gitkeep', content: '' },
    { path: 'static/favicon.ico', content: '' },
  ]
}

/**
 * 生成 Docsy 主题特定的配置（文档型网站）
 */
function generateDocsyConfig(config: BlogConfig): FileTemplate[] {
  const hugoConfig = `baseURL: "${config.baseURL}"
languageCode: "${config.language}"
title: "${config.title}"
theme: "docsy"

enableRobotsTXT: true
enableGitInfo: false

contentDir: "content"
defaultContentLanguage: "${config.language}"
defaultContentLanguageInSubdir: false
enableMissingTranslationPlaceholders: true

pygmentsCodeFences: true
pygmentsUseClasses: false
pygmentsUseClassic: false
pygmentsStyle: "tango"

outputs:
  home:
    - HTML
    - RSS
    - print
  section:
    - HTML
    - RSS
    - print

params:
  copyright: "${config.author}"
  description: "${config.description}"
  
  privacy_policy: ""
  
  version_menu: "Releases"
  archived_version: false
  version: "1.0"
  url_latest_version: "https://example.com/"
  
  github_repo: ""
  github_project_repo: ""
  github_subdir: ""
  
  gcs_engine_id: ""
  
  offlineSearch: true
  offlineSearchSummaryLength: 200
  offlineSearchMaxResults: 25
  
  prism_syntax_highlighting: false
  
  ui:
    sidebar_menu_compact: true
    sidebar_menu_foldable: false
    sidebar_cache_limit: 10
    breadcrumb_disable: false
    sidebar_search_disable: false
    navbar_logo: true
    footer_about_disable: false
  
  links:
    user:
      - name: "GitHub"
        url: "https://github.com/"
        icon: "fab fa-github"
        desc: "GitHub"

menu:
  main:
    - identifier: docs
      name: 📖 文档
      url: /docs/
      weight: 10
    - identifier: blog
      name: 📝 博客
      url: /blog/
      weight: 20

markup:
  goldmark:
    renderer:
      unsafe: true
  highlight:
    style: tango
`

  const indexContent = `---
title: "${config.title}"
---

{{< blocks/cover title="欢迎来到 ${config.title}" image_anchor="top" height="full" >}}
<a class="btn btn-lg btn-primary me-3 mb-4" href="/docs/">
  开始阅读 <i class="fas fa-arrow-alt-circle-right ms-2"></i>
</a>
<p class="lead mt-5">${config.description}</p>
{{< /blocks/cover >}}

{{< blocks/section color="primary" type="row" >}}

{{< blocks/feature icon="fa-lightbulb" title="功能一" >}}
描述功能一
{{< /blocks/feature >}}

{{< blocks/feature icon="fab fa-github" title="GitHub" url="https://github.com/" >}}
查看源码
{{< /blocks/feature >}}

{{< blocks/feature icon="fa-book" title="文档" url="/docs/" >}}
阅读完整文档
{{< /blocks/feature >}}

{{< /blocks/section >}}
`

  const docsIndex = `---
title: "文档"
linkTitle: "文档"
weight: 20
menu:
  main:
    weight: 20
---

欢迎阅读文档！
`

  const gettingStarted = `---
title: "快速开始"
linkTitle: "快速开始"
weight: 1
description: >
  如何快速开始使用
---

## 前提条件

在开始之前，请确保你已经安装了必要的软件。

## 安装步骤

1. 克隆仓库
2. 安装依赖
3. 启动项目

## 下一步

继续阅读其他文档了解更多信息。
`

  const blogIndex = `---
title: "博客"
linkTitle: "博客"
menu:
  main:
    weight: 30
---

这里是博客文章列表。
`

  const sampleBlogPost = `---
title: "第一篇博客"
linkTitle: "第一篇博客"
date: ${new Date().toISOString()}
description: >
  这是我的第一篇博客文章
author: "${config.author}"
---

## 欢迎

这是使用 **Hugo Docsy** 主题创建的第一篇博客文章。

Docsy 主要用于技术文档网站，但也支持博客功能。

## 特点

- 📖 适合文档网站
- 🔍 内置搜索
- 📱 响应式设计
- 🎨 可定制主题

---

感谢阅读！
`

  return [
    { path: 'hugo.yaml', content: hugoConfig },
    { path: 'content/_index.md', content: indexContent },
    { path: 'content/docs/_index.md', content: docsIndex },
    { path: 'content/docs/getting-started/_index.md', content: gettingStarted },
    { path: 'content/blog/_index.md', content: blogIndex },
    { path: 'content/blog/first-post.md', content: sampleBlogPost },
    { path: 'static/favicon.ico', content: '' },
    { path: 'assets/.gitkeep', content: '' },
  ]
}

/**
 * 生成默认/通用博客配置
 */
function generateDefaultConfig(config: BlogConfig): FileTemplate[] {
  const hugoConfig = generateHugoConfig(config)
  
  const indexContent = `---
title: "首页"
---

# 欢迎来到 ${config.title}

${config.description}
`

  const aboutContent = `---
title: "关于"
date: ${new Date().toISOString()}
draft: false
---

## 关于我

这是一个关于页面。

## 联系方式

- Email: your@email.com
`

  const samplePost = `---
title: "我的第一篇文章"
date: ${new Date().toISOString()}
draft: false
description: "这是我的第一篇博客文章"
categories:
  - 技术
tags:
  - Hugo
  - 博客
---

## 欢迎

这是我的第一篇博客文章！

## 内容

在这里写你的内容...

---

感谢阅读！
`

  return [
    { path: 'hugo.yaml', content: hugoConfig },
    { path: 'content/_index.md', content: indexContent },
    { path: 'content/about.md', content: aboutContent },
    { path: 'content/posts/_index.md', content: '---\ntitle: "文章"\n---\n' },
    { path: 'content/posts/first-post.md', content: samplePost },
    { path: 'content/categories/_index.md', content: '---\ntitle: "分类"\n---\n' },
    { path: 'content/tags/_index.md', content: '---\ntitle: "标签"\n---\n' },
    { path: 'static/favicon.ico', content: '' },
    { path: 'layouts/.gitkeep', content: '' },
  ]
}

/**
 * 根据主题获取博客模板文件列表
 */
export function getBlogTemplates(config: BlogConfig): FileTemplate[] {
  switch (config.theme) {
    case 'stack':
      return generateStackConfig(config)
    case 'papermod':
      return generatePaperModConfig(config)
    case 'loveit':
      return generateLoveItConfig(config)
    case 'blowfish':
      return generateBlowfishConfig(config)
    case 'congo':
      return generateCongoConfig(config)
    case 'docsy':
      return generateDocsyConfig(config)
    default:
      return generateDefaultConfig(config)
  }
}

/**
 * 获取主题的目录结构说明
 */
export function getThemeDirectoryInfo(theme: HugoTheme): {
  structure: string
  description: string
} {
  const structures: Record<HugoTheme, { structure: string; description: string }> = {
    stack: {
      structure: `
├── content/
│   ├── _index.md           # 首页
│   ├── page/               # 特殊页面
│   │   ├── about/          # 关于页
│   │   ├── archives/       # 归档页
│   │   └── search/         # 搜索页
│   ├── posts/              # 博客文章
│   │   └── my-post/
│   │       ├── index.md
│   │       └── cover.jpg
│   ├── categories/         # 分类
│   └── tags/               # 标签
├── assets/
│   └── img/
│       └── avatar.png      # 头像
└── hugo.yaml               # 配置文件`,
      description: 'Stack 主题使用 page 目录存放特殊页面，posts 目录存放文章，支持文章封面图片',
    },
    papermod: {
      structure: `
├── content/
│   ├── _index.md           # 首页
│   ├── archives.md         # 归档页
│   ├── search.md           # 搜索页
│   ├── posts/              # 博客文章
│   │   └── my-post.md
│   ├── categories/         # 分类
│   └── tags/               # 标签
└── hugo.yaml               # 配置文件`,
      description: 'PaperMod 主题结构简洁，归档和搜索页放在 content 根目录',
    },
    loveit: {
      structure: `
├── content/
│   ├── _index.md           # 首页
│   ├── about/              # 关于页
│   │   └── index.md
│   ├── posts/              # 博客文章
│   │   └── my-post/
│   │       ├── index.md
│   │       └── featured.jpg
│   ├── categories/         # 分类
│   └── tags/               # 标签
└── hugo.yaml               # 配置文件`,
      description: 'LoveIt 主题支持文章目录形式，可包含特色图片和其他资源',
    },
    blowfish: {
      structure: `
├── config/
│   └── _default/
│       ├── languages.toml  # 语言配置
│       ├── menus.toml      # 菜单配置
│       ├── params.toml     # 参数配置
│       └── markup.toml     # 标记配置
├── content/
│   ├── _index.md           # 首页
│   ├── about/              # 关于页
│   │   └── index.md
│   ├── posts/              # 博客文章
│   │   └── my-post/
│   │       ├── index.md
│   │       └── feature*.jpg # 特色图片
│   ├── categories/         # 分类
│   └── tags/               # 标签
├── assets/
│   └── img/
│       ├── author.jpg      # 作者头像
│       └── background.jpg  # 背景图
└── hugo.toml               # 基础配置`,
      description: 'Blowfish 使用分离的 TOML 配置文件，支持多种首页布局和配色方案',
    },
    congo: {
      structure: `
├── config/
│   └── _default/
│       ├── params.toml     # 参数配置
│       └── menus.toml      # 菜单配置
├── content/
│   ├── _index.md           # 首页
│   ├── posts/              # 博客文章
│   │   └── my-post.md
│   ├── categories/         # 分类
│   └── tags/               # 标签
├── assets/
│   └── img/
│       └── author.jpg      # 作者头像
└── hugo.toml               # 基础配置`,
      description: 'Congo 主题配置简洁，与 Blowfish 类似但更轻量',
    },
    docsy: {
      structure: `
├── content/
│   ├── _index.md           # 首页（Landing Page）
│   ├── docs/               # 文档区域
│   │   ├── _index.md
│   │   └── getting-started/
│   │       └── _index.md
│   └── blog/               # 博客区域
│       ├── _index.md
│       └── my-post.md
└── hugo.yaml               # 配置文件`,
      description: 'Docsy 是文档导向的主题，有独立的 docs 和 blog 区域',
    },
    default: {
      structure: `
├── content/
│   ├── _index.md           # 首页
│   ├── about.md            # 关于页
│   ├── posts/              # 博客文章
│   │   └── my-post.md
│   ├── categories/         # 分类
│   └── tags/               # 标签
└── hugo.yaml               # 配置文件`,
      description: '默认的 Hugo 博客结构',
    },
  }

  return structures[theme] || structures.default
}

/**
 * 主题安装命令
 * 注意：对于使用 tag 的主题，需要分两步执行
 */
export function getThemeInstallCommand(theme: HugoTheme): string {
  const commands: Record<HugoTheme, string> = {
    // Stack 和 LoveIt 使用 tag，需要先 add 再 checkout
    stack: 'git submodule add https://github.com/CaiJimmy/hugo-theme-stack themes/hugo-theme-stack && cd themes/hugo-theme-stack && git checkout v3.34.1',
    papermod: 'git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod',
    loveit: 'git submodule add https://github.com/dillonzq/LoveIt themes/LoveIt && cd themes/LoveIt && git checkout v0.3.0',
    blowfish: 'git submodule add https://github.com/nunocoracao/blowfish themes/blowfish',
    congo: 'git submodule add https://github.com/jpanther/congo themes/congo',
    docsy: 'git submodule add https://github.com/google/docsy themes/docsy',
    default: '',
  }

  return commands[theme] || ''
}
