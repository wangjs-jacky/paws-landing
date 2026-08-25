# Paws React Bits Homepage Redesign

Date: 2026-08-25
Status: Approved in chat; awaiting specification review

## Summary

Rebuild the Paws landing-page homepage as a React and Vite application with a cursor-reactive visual system inspired by the current React Bits homepage. The redesign keeps the Paws orange-and-black brand and mascot, adds bilingual and light/dark presentation, removes fabricated social proof, and preserves the existing documentation URLs.

The signature interaction is an adapted React Bits `DotField` using an orange “Ember” treatment. Pointer movement temporarily displaces a field of dots and creates a local glow; the field settles when the pointer stops. Touch devices, low-power contexts, and reduced-motion preferences receive a simpler presentation.

## Goals

- Make the homepage feel recognizably modern, technical, and interactive without copying React Bits branding.
- Present a truthful, immediately understandable explanation of Paws.
- Support English and Simplified Chinese from the same React page.
- Support light and dark themes with persistent user choices.
- Give desktop users a polished cursor-reactive hero while keeping mobile performance and accessibility strong.
- Replace the current single-file implementation with maintainable React components.
- Keep `/docs`, `/docs/zh-CN`, mascot images, documentation controls, and any installer script present on the integration base working after the build migration.
- Continue automatic Cloudflare Pages deployment through GitHub Actions.

## Non-goals

- Redesigning the documentation pages in this change.
- Changing Paws CLI, server, authentication, or pairing behavior.
- Adding a CMS, analytics product, account system, or backend.
- Using React Bits Pro or introducing fabricated customer logos, usage statistics, or testimonials.
- Recreating every animation or customization control from the React Bits website.

## Current-state Findings

The current homepage is one `web/index.html` file containing its markup, styles, content data, and behavior. It does not use React or a component library. Desktop rendering is functional, but the page is English-only, the mobile navigation collapses to a single download action, the mascot is not visible in the initial 390-pixel mobile viewport, and language/theme controls differ from the documentation experience.

The existing marquee and testimonial section contain placeholder company names and invented testimonials. These will be removed rather than restyled.

## Visual Direction

### Brand system

- Dark theme: near-black and warm charcoal surfaces, off-white text, Paws orange as the dominant active color, and restrained blue/green status colors.
- Light theme: warm off-white surfaces, brown-black text, darker accessible orange, and softer shadows.
- Typography: keep the current Bricolage Grotesque, DM Sans, and JetBrains Mono family combination so the redesign remains recognizably Paws.
- Shape language: medium radii, thin borders, compact pills, and terminal-like mono details. Avoid generic gradient-heavy SaaS styling.

### Motion system

- Hero background: adapted React Bits `DotField` with the orange Ember preset.
- Hero ambient layer: a slow orange color bend or CSS light field beneath the dots; it must never reduce headline contrast.
- Feature cards: adapted React Bits `SpotlightCard`, with pointer position affecting only the hovered card.
- Content entrances: short opacity and translate transitions triggered once as content enters the viewport.
- Mascot: subtle pointer parallax on desktop only, clamped to a small range.
- All motion uses a consistent easing curve and remains decorative. Core actions never depend on animation.

### Motion degradation

- `prefers-reduced-motion: reduce`: render the dot field as a static canvas or CSS pattern; disable parallax and reveal transitions.
- Coarse pointers and touch devices: do not run a permanent pointer-tracking loop. Use a lower-density static or slowly ambient field.
- Offscreen canvases: stop animation work with Intersection Observer and resume only when visible.
- Device pixel ratio: cap canvas rendering at 2x and lower dot density on narrow screens.

## Information Architecture

### 1. Navigation

- Paws brand and mascot avatar.
- Anchors for Product, How it works, and Open source.
- Links to documentation and GitHub.
- One segmented EN/中文 control.
- One light/dark theme control.
- Primary “Get Paws” action.
- On mobile, use a compact accessible menu instead of hiding every navigation destination.

### 2. Hero

- Eyebrow communicating open source and self-hosted operation.
- Clear outcome-focused headline and supporting paragraph.
- Primary action to the quick-start documentation.
- Secondary action to GitHub.
- Copyable install command.
- Paws mascot in a layered visual stage.
- Ember DotField and ambient color treatment behind the content.

### 3. Supported agents

Show only factual compatibility labels: Claude Code, Codex, Gemini, OpenCode, and ACP-compatible agents. This replaces the fabricated company-logo marquee. Labels may move in a restrained loop on desktop, but remain readable and static when motion is reduced.

### 4. How Paws works

Three steps:

1. Install the Paws CLI on the computer running the coding agent.
2. Pair the computer with the Paws mobile or web client.
3. Start, attach, and control agent sessions remotely.

The visual should explain the computer-to-encrypted-relay-to-phone flow without implying that Paws grants Git repository permissions.

### 5. Product capabilities

Use four Spotlight Cards for:

- Remote agent sessions.
- End-to-end encrypted synchronization.
- Remote permission handling.
- Open-source self-hosting.

Copy must be factual and consistent with the existing documentation.

### 6. Open-source and self-hosting section

Pair concise explanatory copy with a terminal or topology visual. Provide direct actions to the GitHub repository and self-hosting documentation. Do not display invented adoption metrics.

### 7. Final call to action and footer

- Repeat the install command and documentation action.
- Link to English docs, Chinese docs, GitHub, and privacy information.
- Do not make a license claim in the footer until the landing-page repository contains a matching license file; retain the link to the upstream Paws project where its licensing is documented.

## Localization

- Store English and Simplified Chinese strings in a typed content module rather than duplicating the page tree.
- On first visit, use Chinese when the browser language begins with `zh`; otherwise use English.
- Store an explicit user choice in `localStorage` under a versioned Paws homepage preference key.
- The language control updates all page content without a full reload and updates `<html lang>`, the document title, the description meta tag, and accessible labels.
- Documentation links route to `/docs` for English and `/docs/zh-CN` for Chinese.
- Language selection is independent of theme selection.

## Theme Behavior

- On first visit, follow `prefers-color-scheme`.
- Persist an explicit theme choice in `localStorage`.
- Apply the resolved theme before React paints to avoid a visible theme flash.
- Update `color-scheme`, theme-color metadata, canvas colors, and accessible button labels when the theme changes.
- If storage is unavailable, continue with in-memory state and system defaults.

## React Architecture

### Application structure

```text
index.html
package.json
vite.config.js
src/
  app/
    App.jsx
    content.js
    preferences.js
  components/
    Header.jsx
    Hero.jsx
    AgentStrip.jsx
    HowItWorks.jsx
    FeatureGrid.jsx
    OpenSource.jsx
    FinalCTA.jsx
    Footer.jsx
    InstallCommand.jsx
    react-bits/
      DotField.jsx
      SpotlightCard.jsx
  styles/
    tokens.css
    global.css
    components.css
  main.jsx
public/
  assets/
  docs.html
  docs/zh-CN.html
  install.sh (only when present on the integration base)
```

Vite builds to `dist/`, which becomes the only Cloudflare Pages upload directory.

### React Bits source policy

React Bits is a copy-and-customize collection rather than a required monolithic runtime dependency. Copy only the free components needed for this page, retain source attribution in component comments, and record the upstream React Bits MIT license where required.

`DotField` will be adapted from the official landing-page implementation, with Paws tokens, simpler render gating, and mobile/reduced-motion behavior. `SpotlightCard` will be adapted from the official free component. Avoid React Bits Pro code and unnecessary animation dependencies.

### State and data flow

- `App` resolves and owns language and theme preferences.
- Preference utilities are pure functions with guarded storage adapters.
- Components receive localized content and resolved theme through props or a small context; no global state library is needed.
- Pointer state remains local to the visual component that needs it.
- Install-command copy state remains local to `InstallCommand` and announces success through an ARIA live region.

## Static-file Migration

- Move existing public documentation and required assets into `public/` without changing their final URLs.
- Preserve the current documentation control scripts and styles.
- Do not silently absorb unrelated work from another branch. If `/install.sh` exists on the integration base when implementation begins, move it byte-for-byte to `public/install.sh` and test that `/install.sh` remains available. If it has not been merged, this homepage change will not recreate or modify that script.
- Add a local link checker for important public routes and assets.

## Accessibility

- Semantic landmarks and heading order.
- Keyboard-operable navigation, mobile menu, preference controls, install-command copy action, and cards that contain links.
- Visible `:focus-visible` states with sufficient contrast in both themes.
- Minimum 44-by-44-pixel touch targets.
- ARIA live feedback for copy success.
- Decorative canvases and SVGs hidden from assistive technology.
- No information conveyed only by color or animation.
- Maintain readable contrast over the animated hero at all pointer positions.

## Failure Handling

- Canvas unavailable: render the static CSS dot background.
- Local storage unavailable: use browser defaults and retain current-session state.
- Clipboard API unavailable or rejected: use a safe selection/copy fallback and show accurate feedback only after success.
- JavaScript bundle failure: the root HTML still provides useful metadata, background color, and a `noscript` link to documentation.
- External font failure: use explicit local fallback stacks without layout collapse.

## Build and Deployment

Add standard scripts:

- `npm run dev` for local development; do not start it automatically during implementation.
- `npm run build` for the production Vite build.
- `npm test` for unit and component tests.
- `npm run check` for the full static verification set.

Update the Cloudflare Pages workflow to:

1. Install dependencies with the committed lockfile.
2. Run tests and the production build.
3. Deploy `dist/` instead of `web/`.
4. Verify the production homepage marker and confirm that both English and Chinese content are present in the built JavaScript bundle.
5. Continue verifying `/docs` and `/docs/zh-CN`.

Workflow path filters must include application source, public assets, package manifests, Vite configuration, and the workflow itself.

## Testing Strategy

### Unit tests

- Resolve browser language correctly.
- Saved language overrides browser language.
- Saved theme overrides system preference.
- Invalid or inaccessible storage falls back safely.
- Install-command copy fallback behavior.

### Component tests

- Language and theme controls update visible content and document attributes.
- Mobile menu is keyboard operable and closes after navigation.
- Install command exposes correct ARIA feedback.
- Reduced-motion mode disables nonessential animation behavior.

### Production build checks

- Vite production build succeeds with no missing assets.
- Important public files exist in `dist/`.
- Local documentation links and IDs remain valid.

### Browser verification

- Desktop Chromium: pointer movement visibly affects DotField, settling occurs, navigation works, and both themes maintain contrast.
- 390-pixel mobile viewport: no horizontal overflow, mascot and main call to action appear intentionally, menu remains usable, and touch targets meet minimum size.
- Language and theme choices survive reloads.
- Reduced-motion emulation produces a stable, noncontinuous background.
- Production URLs return HTTP 200 and contain the expected new homepage markers.

## Rollout and Recovery

- Implement on a feature branch and deliver through a pull request.
- Keep documentation content behaviorally unchanged except for relocation into the Vite public directory.
- GitHub Actions must pass before merging.
- If production verification fails, do not report completion; inspect the deployment or revert the homepage merge through a normal Git revert.

## Acceptance Criteria

- The production homepage is rendered by React and built by Vite.
- Desktop pointer movement produces the approved orange Ember DotField interaction.
- English/Chinese and light/dark controls work and persist.
- Mobile navigation exposes all important destinations and has no horizontal overflow.
- The page contains no fabricated company endorsements, statistics, or testimonials.
- `/docs` and `/docs/zh-CN` continue to work after deployment.
- The static-file policy for `/install.sh` is followed according to the integration base.
- Automated tests, production build, local browser checks, GitHub Actions deployment, and live URL verification pass.

## Approved Decisions

- Scope: complete homepage reconstruction.
- Visual direction: React Bits-like technology aesthetic.
- Hero interaction: Ember DotField.
- Language default: follow browser language; persist user override.
- Theme default: follow system preference; persist user override.
- Social proof: remove fabricated company logos and testimonials.
