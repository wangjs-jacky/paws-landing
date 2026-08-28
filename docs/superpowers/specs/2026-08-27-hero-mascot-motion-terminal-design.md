# Paws Hero Mascot Motion and Terminal Refinement

Date: 2026-08-27
Status: Approved in chat; awaiting written-spec review
Repository: `wangjs-jacky/paws-landing`

## Objective

Repair the homepage's weak alignment and visual hierarchy without rebuilding the rest of the site. The revised first screen must:

- align the header controls and hero columns on a consistent grid;
- replace the mascot's opaque black square with an identity-preserving transparent asset;
- let the mascot look left and right in response to the pointer;
- restore the original terminal typewriter interaction;
- keep the Ember DotField, bilingual preferences, light/dark themes, documentation routes, and truthful product content;
- degrade safely on mobile, reduced-motion devices, and asset-loading failures.

## Scope

This is a focused Header + Hero revision. Later homepage sections retain their current content and structure except for any spacing adjustment required to meet the new hero boundary.

In scope:

- header sizing and control alignment;
- hero grid, typography, mascot presentation, and terminal composition;
- one new transparent mascot still;
- one authorized MiniMax H3 video-generation task;
- reproducible extraction of a transparent pointer-controlled frame atlas;
- component, unit, and browser tests;
- a public preview before production integration.

Out of scope:

- a literal 360-degree character rotation;
- redesigning later product sections;
- changing the mascot's species, hoodie, orange paw mark, or friendly identity;
- additional paid H3 retries without renewed authorization;
- Android Motion Photo, GIF, or social-media deliverables;
- changes to `/docs`, `/docs/zh-CN`, or `/install.sh`.

## Confirmed Generation Batch

The user explicitly authorized this exact batch:

- static image batch: one identity-preserving transparent PNG;
- paid video batch: one MiniMax H3 task;
- video specification: `768P`, `5 seconds`, `1:1`;
- submission count: exactly one;
- retry policy: no automatic paid retry;
- output purpose: verified MP4 plus website static/atlas assets;
- no Android Motion Photo.

The current public China pricing page does not list H3, so no reliable public RMB estimate is asserted. The user's MiniMax invoice is authoritative.

## Visual System

- Palette: existing Paws orange, warm black, warm off-white, and current semantic text/border tokens.
- Typography: Bricolage Grotesque display stack, DM Sans body stack, JetBrains Mono code stack.
- Spacing: 8px base rhythm with 4/8/12/16/24/32/48/64px steps.
- Radius: 12px controls, 16px terminal, 20px large media surfaces, pills only for primary CTA.
- Shadows: one restrained floating-header shadow and one deep terminal shadow; no independent card shadow behind the mascot.
- Motion: responsive but calm. Pointer response uses interpolation rather than snapping. Idle motion stays below 8px of translation.

## Header Design

The desktop header uses a fixed 72px visual height inside the existing page-width boundary.

- Brand, navigation, preference controls, and CTA share one vertical centerline.
- The language control becomes one compact 44px-high button that displays the destination language (`中文` while English is active, `EN` while Chinese is active). It is not a two-segment switch.
- Theme and mobile-menu controls remain 44x44px.
- The primary CTA is 44px high and visually aligned with the two preference controls.
- Navigation gaps use one scale rather than fluid values that visibly drift across the row.
- Mobile keeps the existing collapsible menu and accessible labels.

## Hero Composition

Desktop uses a stable 55/45 split with a shared centerline and a restrained maximum width.

Left column:

- eyebrow;
- a two-line Chinese headline rather than the current accidental three/four-line wrap;
- supporting paragraph;
- two actions;
- interactive terminal.

Right column:

- transparent mascot without a rectangular image background;
- a soft orange halo derived from the current accent;
- DotField remains behind the full hero;
- no separate black media card.

The mascot may overlap the terminal boundary slightly at wide desktop sizes, but neither column may obscure readable text or controls. At mobile widths the mascot becomes a smaller centered visual above the copy, while the terminal remains full-width below the actions.

## Mascot Source and H3 Direction

### Static source

Use the existing `public/assets/mascot-hero.png` as the identity reference. The image edit must preserve:

- marmot face shape, eye spacing, muzzle, ears, and fur color;
- black hoodie, drawstrings, orange paw mark, and thumbs-up pose;
- friendly expression and body proportions;
- centered full-body framing.

Remove the opaque black background and produce a true-alpha PNG. Do not add text, scenery, props, extra digits, or a new costume.

### H3 first frame

Composite the approved transparent PNG over a uniform chroma-green square for H3 input. The generated clip must keep:

- locked camera and framing;
- fixed torso, hoodie, logo, hands, and thumbs-up pose;
- stable green background suitable for keying;
- one blink and subtle breathing;
- motion path: begin centered, move briefly to the left extreme, then make one smooth monotonic left-to-right head/gaze turn of approximately 120–160 degrees total.

The prompt must explicitly prohibit camera movement, body rotation, walking, talking, mouth deformation, clothing/logo drift, background texture, extra limbs, and scene cuts.

### Failure policy

Submit once. If the H3 task fails or the result has unacceptable identity/hand/logo drift, do not create another paid task. Keep the static transparent mascot with CSS parallax as the production fallback and report the H3 result for a renewed decision.

## Motion Asset Pipeline

1. Download and verify the exact successful H3 MP4 with `ffprobe` and full decode.
2. Inspect a contact sheet for identity, hand, hoodie, logo, green-screen stability, black frames, and scene drift.
3. Select only the monotonic left-to-right portion after the initial centered-to-left setup.
4. Extract 24 evenly spaced frames.
5. Chroma-key the green background and retain alpha.
6. Normalize each frame to an identical transparent square and build one 6x4 WebP atlas.
7. Export a center-facing transparent static WebP/PNG fallback from the verified sequence or the approved source still.
8. Record the exact source task ID, trim interval, frame count, keying values, and ffmpeg commands beside the artifacts for reproducibility.

The atlas must be visually inspected for edge halos, frame ordering, face drift, logo drift, and alpha correctness. If WebP alpha encoding is unavailable, use a PNG atlas and report the larger payload.

## Pointer-Controlled Mascot Component

Create a dedicated `MascotLook` component with a small pure mapping module.

Inputs:

- atlas source and static fallback source;
- frame columns/rows/count;
- reduced-motion state;
- visibility and pointer capability.

Behavior:

- Load one atlas image and draw the selected frame to a transparent canvas.
- Normalize horizontal pointer position over the hero from `-1` to `1`.
- Map it to frame `0..23` and ease toward the target using a single requestAnimationFrame loop.
- Apply at most 4px of vertical CSS translation from pointer Y; head direction comes from atlas frames, not 2D rotation.
- When the pointer leaves, ease to the center frame.
- When the hero is offscreen, stop RAF and pointer geometry work.
- On coarse pointer, use the center frame with subtle CSS breathing only.
- Under `prefers-reduced-motion`, show the static fallback with no RAF or breathing.
- If atlas load, decode, or canvas drawing fails, show the static fallback and keep the page functional.

The component must clean up RAF, observers, image callbacks, and event listeners on unmount.

## Terminal Interaction

Restore the earlier terminal interaction as a React component rather than copying the old global script.

Presentation:

- dark terminal surface in both themes;
- three window controls and localized title;
- installation prompt in the first line;
- an integrated accessible copy button;
- typewriter output with an orange caret;
- no separate large white install-command card in the hero.

Sequence mirrors the original factual interaction:

1. `$ paws`
2. relay started on the local machine
3. phone paired
4. coding agent attached
5. example file edit
6. waiting for approval on the phone

The sequence may be localized, but commands, file paths, and factual product behavior remain unchanged. It starts when the terminal enters view, pauses offscreen, and loops after a calm hold. Reduced-motion renders the complete transcript immediately. Copy feedback uses the existing accessible clipboard helper and localized live-region labels.

## Data and Component Boundaries

- `content.js`: localized headline line grouping, terminal title/status strings, and labels.
- `siteConstants.js`: exact install command and unchanged documentation routes.
- `Hero.jsx`: composition only; it must not own frame extraction or typewriter timing internals.
- `MascotLook.jsx`: pointer/visibility/canvas presentation.
- `mascotFrameModel.js`: pure normalized-pointer-to-frame mapping and easing helpers.
- `TerminalDemo.jsx`: terminal state machine and clipboard integration.
- `components.css` / `tokens.css`: header/hero/terminal layout and existing theme tokens.
- `scripts/`: reproducible video verification and atlas extraction commands/scripts where practical.

## Accessibility and Performance

- All controls remain keyboard accessible with visible focus.
- Language, theme, copy, menu, and terminal labels update with the selected language.
- Touch targets remain at least 44x44px.
- Canvas is decorative and has a meaningful static image fallback with localized alt text.
- The animation loop parks when its frame reaches the target or the hero is offscreen.
- Only one atlas request is used; no 24-request frame waterfall.
- The generated atlas has a documented byte budget target of 3 MB or less. If it exceeds 3 MB, tune WebP quality/dimensions before integration while preserving acceptable facial detail.
- Layout must not shift when the atlas loads.

## Verification

Unit/component tests:

- normalized pointer values map to expected edge and center frames;
- easing settles and parks;
- atlas failure renders the static fallback;
- offscreen/reduced-motion modes perform no animation work;
- terminal starts in view, types in order, pauses/cleans up, and renders statically under reduced motion;
- copy success and failure remain announced;
- language control displays the destination language.

Browser checks at 1440x1000 and 390x844:

- header controls share a vertical centerline and do not overlap;
- Chinese headline is exactly two visual lines at the desktop reference viewport;
- mascot has transparent edges and no black rectangle in light or dark theme;
- pointer movement visibly changes mascot frames and returns to center;
- terminal animation and copy behavior work;
- mobile has no horizontal overflow and all primary controls meet 44px;
- reduced-motion shows a static mascot and complete terminal transcript;
- `/docs` and `/docs/zh-CN` remain unchanged and reachable.

Run `npm run check`, the focused component tests, Playwright, and `git diff --check`. Publish a public preview for review before production merge.

## Delivery

The first public preview should expose the complete Header/Hero v0 early enough to catch proportion or mascot-direction problems. H3 generation may proceed after the approved static identity frame passes inspection; the already granted exact paid authorization remains valid and is not requested again. Production integration still requires a clean review, green CI, and live browser verification.
