# archive/ — 从落地页移除的模块（保留供复用）

落地页现在只有三个模块（顶栏 / Hero 预告片轮播 / 页脚）。本目录保存了被移出落地页的
所有模块代码、数据和三语文案，**不参与构建**，仅作为其他前端复用的素材来源。

- `tsconfig.json` 的 `exclude` 里已加入 `archive`，所以这里的文件不做类型检查。
- 目录不在 `app/` 下且无人 import，Next.js 不会编译它，对产物体积零影响。

## 内容清单

| 路径 | 说明 |
|---|---|
| `components/landing/about-zenorix.tsx` | About Zenorix 段（含平台矩阵、规格说明） |
| `components/landing/faq-section.tsx` | FAQ 折叠列表 |
| `components/landing/top-chart.tsx` | TOP 10 榜单 |
| `components/landing/film-info.tsx` / `film-synopsis.tsx` | 影片信息与可展开剧情简介 |
| `components/landing/final-cta.tsx` | 页尾转化 CTA |
| `components/landing/immersive-player.tsx` | 沉浸式播放器（静音自动播放、播放/静音控制） |
| `components/landing/conversion-provider.tsx` / `conversion-dialogs.tsx` | 转化弹窗的状态容器与两个 `md-dialog` 弹窗 |
| `components/landing/film-landing.tsx` | **旧的落地页组装文件**——想知道这些模块原本的排列顺序和传参，看这个 |
| `components/material-web-loader.tsx` | Material Web 自定义元素的按需注册器 |
| `lib/content/movies.ts` / `platforms.ts` | 榜单影片与流媒体平台的 mock 数据 |
| `lib/analytics.ts` | `trackEvent` 埋点封装 |
| `types/material-web.d.ts` | `md-icon` / `md-dialog` 等自定义元素的 JSX 类型声明 |
| `styles/landing.css` | **改造前的完整样式表（2306 行）**，包含上述所有模块的样式 |
| `dictionaries/{en,pt-br,th}.json` | **改造前的完整三语文案**，含 `about` / `faq` / `chart` / `info` / `player` / `finalCta` / `modals` 各段 |
| `routes/film-detail-page.tsx` | 已下线的单片详情路由 |
| `public/brands/*` `public/media/*` | 上述模块引用的占位图（平台 logo、海报、剧照） |

文案是最难重建的部分：现在线上的 `dictionaries/*.json` 只剩品牌站需要的
`meta` / `nav` / `hero` / `cta` / `footer` / `a11y`，而这里的三个 JSON 保留了
`market` / `player` / `info` / `chart` / `about` / `faq` / `finalCta` / `modals` 的
英语、葡语、泰语全量译文。

## 复用时需要处理的三件事

1. **导入路径**。这些文件里的 `@/components/landing/...`、`@/lib/content/...`、
   `@/lib/analytics` 指向的是它们**原来**的位置，而那些位置现在已没有文件。复制到新项目
   后需要按新结构改写这些 import。
2. **Material Web 依赖**。`@material/web` 已从 `package.json` 移除。凡是用到
   `md-icon` / `md-dialog` / `md-filled-button` 的文件（见上表）需要先
   `pnpm add @material/web`，并搭配 `material-web-loader.tsx` 与 `types/material-web.d.ts`，
   否则自定义元素不会升级、样式变量也不生效。另外这些组件依赖 Material Symbols 图标字体
   （原先在 `<head>` 里以 stylesheet 引入）。
3. **CSS 变量已改名**。`styles/landing.css` 用的是 `--md-sys-color-*`；现行
   `app/globals.css` 已统一改为 `--zx-color-*`。整段迁移时需要同步替换前缀，或者只从这份
   旧样式表里摘取需要的段落。
