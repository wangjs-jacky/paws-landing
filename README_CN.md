# Paws — 产品官网

> **Paws** 的产品落地页 —— 在手机上远程操控你电脑上的编程智能体。土拨鼠吉祥物、深色终端风、开源。

**🔗 线上地址：** https://paws-landing-eo4.pages.dev

**📚 中文文档：** https://paws-landing-eo4.pages.dev/docs/zh-CN

[English](./README.md) | 中文

![Paws 落地页 Hero](export/paws-rendered-fixed.png)

---

## 这是什么

这个仓库既是一个**真实、可部署的产品落地页**，也是一条 **AI 驱动的「设计 → 上线」流水线**的完整样例 —— 从「我看到一个动效好看的网站」一路走到「一个真实上线、带动效的站点」，每一环交给最合适的 AI/工具，人只做「看方向、做选择」。

最终页面 `web/index.html` 是一个**单文件、零构建**的自包含页面，包含滚动淡入、卡片 hover 辉光、打字机终端、logo 无限横滚、复制安装命令、吉祥物浮动等动效，部署在 Cloudflare Pages。

## 流水线

| 阶段 | 工具 | 产出 |
|------|------|------|
| ① 看参考站 + 拆动效 | Chrome DevTools | 动效清单 |
| ② 生原型图（3 版选型） | Codex GPT Image 2 | `reference/paws-page-V*.png` |
| ③ 设计稿精修 + 生吉祥物 | Pencil（`.pen`） | `design/paws.pen` |
| ④ 精修：证言区 · 定稿吉祥物 · Docs 页 | Pencil | `.pen` 里 3 个屏 |
| ⑤ 设计稿导出成代码 | Pencil `export_html` | `export/*.html` |
| ⑥ 手写前端加动效 | 原生 HTML/CSS/JS | `web/index.html` |
| ⑦ 部署上线 | Cloudflare Pages（`wrangler`） | 上方线上地址 |

## 目录结构

```
paws-landing/
├── web/            # 部署的站点（单文件 index.html + 资源）
├── design/         # Pencil 源文件（paws.pen）+ 生成的图片
├── export/         # Pencil 导出的 HTML + 渲染截图
├── reference/      # AI 生成的原型图 + 参考站截图
└── assets/brand/   # 定稿吉祥物（Hero 全身 + 头像）
```

## 本地运行

```bash
npx serve web        # 或直接浏览器打开 web/index.html
```

## 部署

```bash
npx wrangler pages deploy web --project-name paws-landing --branch main
```
