# directionforge: design document

Date: 2026-10-23 · Status: approved · Author: amratansh12, with Claude

## 1. Intent

**The goal is UI with no AI slop.** Unsteered AI design converges on the same defaults (purple
gradients, icon-grid feature rows, rounded-everything, Inter-only type, evenly spread colourful
palettes). A staged, reference-led process produces UI that does not look like generic AI-generated design: a
gallery of references grouped by style, two builds per style (impeccable and tasteskill), a
narrowing pick, iterations on the winner, and a final build. `directionforge` packages that process
as an open-source Claude Code plugin, so anyone can run it in any project and get the same rigour.

The core idea: **the UI should match the feel and intent of the references, not their content.**
Every build is bound by guardrails the user writes: *Always* (constants) and *Never* (bans).

## 2. Users and scope

- Who runs it: designers and engineers using Claude Code in any project repo.
- What it designs: product/app screens (dashboards, tables, settings) and marketing/landing pages.
- Out of scope: single components in isolation; native mobile apps.

## 3. Goals, non-goals, anti-goals

Goals
- A repeatable four-stage process with a hard stop for user choice after every stage.
- Distinct directions: each build commits fully to its own aesthetic.
- Everything viewable in one local switcher page.
- A final hand-off a developer can build from (DESIGN.md) and a record of why (decision log).

Non-goals
- Generating or sourcing imagery (always reserved slots, see §7).
- Building a production component library or framework code.
- Choosing for the user. Claude never advances a stage on its own.

Anti-goals (failure even if it "works")
- Directions that blend into each other or converge on one look.
- Generic AI-UI defaults: purple gradients, icon-grid feature rows, rounded-everything, evenly
  distributed colourful palettes, Inter/system-font-only type (examples; the user's Never list rules).
- A reference gallery grouped or tagged by feature instead of by design style.
- Prototypes that copy a reference's content, layout or brand instead of its feel.

## 4. Dependencies and setup (Stage 0)

The plugin relies on two skills:

| Skill | Source | Install |
|---|---|---|
| impeccable | https://impeccable.style/tutorials/getting-started/ (repo github.com/pbakaus/impeccable) | `npx impeccable install` from the project folder (Node ≥ 18.19); directionforge runs the non-interactive form `npx -y impeccable install --project --providers=claude -y`. Team option: `git submodule add https://github.com/pbakaus/impeccable vendor/impeccable` then `npx impeccable link --source=vendor/impeccable --providers=claude` |
| tasteskill (`design-taste-frontend`) | github.com/Leonxlnx/taste-skill, path `skills/taste-skill/` (MIT) | Per its README (checked 2026-10-23): `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` (directionforge adds `--agent claude-code --copy -y` to run without prompts), or inside Claude Code `/plugin marketplace add Leonxlnx/taste-skill` then `/plugin install taste-skill@taste-skill` |

Setup behaviour:
1. Check whether the needed skills are available (project `.claude/skills/`, user `~/.claude/skills/`, or
   an installed plugin). impeccable is always needed; tasteskill only for marketing/landing briefs (§6).
2. If either is missing, say what will be installed and where, and ask before installing (it
   writes into the user's project or home folder).
3. Confirm Node/Python availability for the installer and the local server. impeccable's page says
   Node ≥ 18.19; the reviewer reported that the local tasteskill's scripts need Node 22+ and a local
   Chrome/Edge/Chromium. Builder verifies both against the installed versions.
4. [Claude's call] Do not vendor the skills (keeps them updatable upstream). Install current
   upstream and record each skill's version in `design/decisions.md` so a run can be reproduced.

## 5. Intake (before Stage 1)

Claude collects a brief and writes it to `design/brief.md`. It asks for:

- **What**: the page or screen, and product context.
- **Audience and job/conversion goal** (e.g. "book a demo"; "find and correct a record at 100k rows").
- **Intent**: how it should feel, in the user's words (e.g. "calm, crafted intelligence, not loud SaaS hype").
- **Guardrails, written by the user**: *Always* (constants) and *Never* (bans). Claude does not
  draft these; it may ask follow-ups if a list is empty or contradictory, but the wording is the user's.
- **Brand / design system**: ask if one exists (tokens file, colour spec, fonts). If provided, every
  build uses it; if not, each direction chooses its own palette and type within the guardrails.
- **Counts**: defaults are 5 styles × 2 skills, then 3 iterations; the user may change them.
- **Reference source**: user-provided, or Claude gathers (Stage 1).

The brief is shown back for approval before Stage 1.

## 6. The stages

Every stage ends by updating the switcher page and `design/decisions.md`, then stopping with a
clear question. Nothing advances without the user's answer.

### Stage 1: References and gallery

- Ask whether the user will supply references (files or URLs) or Claude should gather them from
  Dribbble, Pinterest, X/Twitter or other sites the user names, based on the use case.
- Save screenshots to `design/references/` with `SOURCES.md` (URL, site, date captured).
- Build `design/references/gallery.html`: an interactive gallery grouping references by **design
  style, visual vocabulary and UI language** (e.g. "Minimal & airy", "Print-tech paper",
  "Data-dense"). Each group has a short description of its feel. No feature tags or feature matrices.
- Interaction: click to enlarge; select groups; a "copy my picks" button puts the selection on the
  clipboard to paste back into Claude.
- Stop: ask the user to shortlist N (default 5) groups.

### Stage 2: Directions (N styles × 2 skills)

- For each picked group Claude drafts a direction block, in the style of:
  `--- DIRECTION 1 (v1) - Print-Tech Paper ---` followed by thesis, type, palette (or brand tokens),
  density, the one signature move, and an image placement note. The user approves or edits them.
- **The approved direction block wins.** Each skill builds that direction; its own
  direction-picking step (tasteskill's draw from its library, impeccable's visual-world roll) is
  skipped. Each pair is one direction built two ways. The skills' craft, inspection and finish
  steps still run.
- Marketing/landing briefs: one prototype per direction with impeccable and one with tasteskill
  (default 10). App-screen briefs: impeccable only (default 5), because tasteskill states it is not
  for dashboards or app screens. Every build prompt carries the same brief, intent and guardrails
  verbatim, plus "do not blend directions; commit fully to this one".
- Each build is self-contained in its own folder and shares only the brand token file (if any)
  and the synthetic dataset.
- Stop: the user names the winner and may list features to borrow from other builds.

### Stage 3: Iterations on the winner (default 3)

- Stage 3 and Stage 4 are built with **the skill that made the winning Stage 2 build**; features
  borrowed from other builds are described in the prompt.
- Claude restates the synthesis (winner + borrowed features) and gets a yes.
- Build 3 distinct iterations of the winner, each named with a one-line thesis (e.g. "Quiet
  canvas", "Inset frame").
- Stop: the user picks components/aspects from each iteration.

### Stage 4: Final

- Claude restates the picks as a composition list and gets a yes.
- Build the final UI.
- Write `design/DESIGN.md` (tokens, type scale, spacing, components and patterns as actually
  shipped in the final build) and complete `design/decisions.md` (what was picked at each stage
  and why, in the user's words where possible).

## 7. Constants across all builds

- **Imagery**: never generate or source images. Reserve each image slot exactly where its
  placement note says (`<img>` or background, correct aspect ratio and position) and fill it with a
  flat CSS stand-in in the direction's palette. Size type and negative space as if the real image
  were there, so it drops in with no layout change.
  Both skills bring in real imagery by default (tasteskill fetches from open archives; impeccable
  ships imagery for marketing pages); the build prompts must override this explicitly.
- **Isolation from the host project** [Claude's call]: all output stays under `design/`. Builds
  must not read the project's root DESIGN.md/PRODUCT.md as the look to keep (they would pull every
  direction toward the existing UI) unless the user supplied them as the brand in §5, and must
  never create or overwrite files at the project root. Skill working folders (e.g. `.taste-skill/`)
  are allowed and listed in the final summary.
  impeccable reads product context from a PRODUCT.md and sends new builds through an interview
  (`init`) when there is none. So at intake directionforge writes `design/PRODUCT.md` from the approved brief
  and every impeccable build runs its context step with `--target` inside `design/`, which resolves
  to that file (verified with impeccable 4.7.0). Builds are code-led (`buildPath: code`, no image
  comps), and build subagents never ask the user anything; they report gaps. `design/DESIGN.md` uses the format of impeccable's
  documenter, written from the shipped final build.
- **Content**: realistic synthetic content, labelled as synthetic. Never reference content.
- **Accessibility**: WCAG 2.2 AA contrast, visible focus, keyboard reachable controls.
- **Verification**: each build is screenshotted at desktop and mobile widths and checked against
  the guardrails before it is shown to the user.

## 8. Output layout and viewing

```
design/
  brief.md
  decisions.md          # running log + current stage (lets a new session resume)
  references/           # screenshots, SOURCES.md, gallery.html
  stage-2/<nn-style>-impeccable/ , <nn-style>-taste/
  stage-3/iter-1/ … iter-3/
  final/
  DESIGN.md
  index.html            # switcher: tabs for stage, style, skill, iteration
```

Served locally with a static server on port 8000 (e.g. `python3 -m http.server 8000` from
`design/`), falling back to the next free port. Plain HTML/CSS/JS, no build step, no framework.

## 9. Repository

Public GitHub repo `amratansh12/directionforge`, MIT licence. Structured as a Claude Code plugin
(manifest + skills). The builder must check
the current Claude Code plugin manifest format in the docs rather than assume it.
[Claude's call] The repo also carries marketplace metadata so anyone can add the GitHub repo as a
marketplace and get updates from it; the README gives both that route and a local-path install.

## 10. Left to the builder

- Internal split of the plugin (one orchestrator skill with per-stage reference files, or one skill
  per stage) and command names.
- How references are captured when Claude gathers them (browser tooling available in the session).
- Gallery and switcher visual design (plain, legible, light/dark).
