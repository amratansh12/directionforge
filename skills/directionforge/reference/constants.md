# Constants for every build

## Imagery: reserve, never produce

- Never generate, fetch or source images, illustrations or photos. This overrides both skills'
  defaults (tasteskill fetches open-archive pictures; impeccable ships imagery on marketing pages).
- For each image slot in the direction's placement note, put the real element in place (`<img>` with
  `width`/`height` or `aspect-ratio`, or a background on the right element) at the exact position
  and aspect ratio, filled with a **flat CSS stand-in** in the direction's palette (solid colour or
  a flat tone; no fake imagery, gradients pretending to be photos, emoji or icon art).
- Size type, crop and negative space as if the real image were there, so it drops in with zero
  layout change. Add `data-slot="<what the image will show>"` to each slot.
- Icons for UI controls are allowed (inline SVG), illustrations are not.

## Content

Realistic synthetic content for the brief's domain, never copied from references. Mark synthetic
data with a small "sample data" label where a reader could mistake it for real data.

## Isolation

- Write only inside the build's folder. Never write at the project root, never edit another
  build's folder, never edit `design/index.html`, `manifest.js` or the gallery.
- Do not treat the project's root DESIGN.md or PRODUCT.md as the look to keep, unless the brief
  names them as the brand.
- Never write or edit any PRODUCT.md or DESIGN.md; `design/PRODUCT.md` is written by the
  orchestrator, `design/DESIGN.md` only in Stage 4.
- Skill working folders the skills create on their own (e.g. `.taste-skill/`, `design/.impeccable/`)
  are allowed; list them in your report.
- Never ask the user anything; report gaps instead.

## Tech

Plain HTML/CSS/JS, no build step, works when served statically from `design/`. Web fonts from
Google Fonts are fine; scripts only from pinned CDN versions if truly needed. Paths relative.

## Accessibility

WCAG 2.2 AA contrast (4.5:1 text, 3:1 large text and UI boundaries), visible focus, every control
keyboard reachable, no information by colour alone, `prefers-reduced-motion` respected, 24px
minimum targets.

## Verification before reporting

Screenshot at 1440 and 390 wide. Check every Never rule, the imagery rule and contrast. Fix in one
batch, confirm once, stop.
