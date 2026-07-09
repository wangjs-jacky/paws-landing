# Paws — Landing Page

> Product landing page for **Paws** — control the AI coding agents running on your computer, right from your phone. Marmot mascot, dark terminal aesthetic, open source.

**🔗 Live:** https://paws-landing-eo4.pages.dev

English | [中文](./README_CN.md)

![Paws landing hero](export/paws-rendered-fixed.png)

---

## What this is

This repo is both a real, deployable product landing page **and** a worked example of an **AI‑driven design → deploy pipeline** — going from "I saw a website with nice motion" all the way to a live, animated site, letting an AI drive each stage while a human just steers.

The final page (`web/index.html`) is a single self‑contained file (zero build step) with scroll‑reveal, card hover glow, a typewriter terminal, an infinite logo marquee, copy‑to‑clipboard, and a floating mascot — deployed to Cloudflare Pages.

## The pipeline

| Stage | Tool | Output |
|------|------|--------|
| ① Observe a reference site & dissect its motion | Chrome DevTools (headless) | animation inventory |
| ② Generate prototype mockups (3 variants) | Codex GPT Image 2 | `reference/paws-page-V*.png` |
| ③ Refine the design + generate mascot | Pencil (`.pen`) | `design/paws.pen` |
| ④ Polish: testimonials · finalize mascot · docs page | Pencil | 3 screens in the `.pen` |
| ⑤ Export design → code | Pencil `export_html` | `export/*.html` |
| ⑥ Hand‑write the front‑end with motion | vanilla HTML/CSS/JS | `web/index.html` |
| ⑦ Ship it | Cloudflare Pages (`wrangler`) | live URL above |

## Structure

```
paws-landing/
├── web/            # the deployed site (single-file index.html + assets)
├── design/         # Pencil source (paws.pen) + generated images
├── export/         # HTML exported from Pencil + render screenshots
├── reference/      # AI-generated prototype mockups + reference-site capture
└── assets/brand/   # finalized mascot artwork (hero + avatar)
```

## Run locally

```bash
# any static server works; e.g.
npx serve web
# or just open web/index.html in a browser
```

## Deploy

```bash
npx wrangler pages deploy web --project-name paws-landing --branch main
```

## Credits

Mascot & prototype imagery generated with GPT Image 2. Design assembled in Pencil. Front‑end hand‑written. Built as a learning exercise in AI‑assisted product design.
