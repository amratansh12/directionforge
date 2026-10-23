---
name: unslop
description: Make UI that does not look AI-made. Reference-led design process for a new or redesigned UI (marketing/landing pages or app screens) - gathers references into a gallery grouped by design style, builds shortlisted directions with impeccable and tasteskill under the user's Always/Never guardrails, iterates on the user's winner, and finishes with a final build, DESIGN.md and a decision log. Use when the user wants distinct, non-generic design directions to choose from, complains that AI UI looks like slop or templated, says "unslop", or wants to run the reference, directions, iterations, final process. Not for small tweaks to an existing design.
---

# unslop

A staged process for UI that does not look AI-made: no generic defaults, no blended directions,
no invented imagery. Distinctiveness comes from real references and the user's own picks.
The user chooses at every stage; Claude never chooses for them. Builds match the **feel and intent** of the references, never their content. The user's **Always**
and **Never** guardrails bind every build.

## Hard rules

1. **Stop after every stage.** End with the switcher link and one clear question. Never start the
   next stage until the user has answered. Silence or "looks good" on one stage is not a pick.
2. **The user writes the guardrails.** Claude may ask follow-ups but never drafts or rewords the
   Always/Never lists.
3. **Directions never blend.** Each build commits fully to its own direction block.
4. **No imagery is generated or sourced.** Image slots are reserved (see `reference/constants.md`).
5. **Stay inside `design/`.** Never create or overwrite files at the project root.
6. **Keep `design/decisions.md` current** after every decision, including the `Current stage` block.

## Resume first

If `design/decisions.md` exists, read it before anything else. Its `Current stage` block says where
the run stopped and what the user owes. Continue from there; do not repeat finished stages.

## The stages

| Stage | Read | Ends with the user… |
|---|---|---|
| 0 · Setup | `reference/setup.md` | approving any installs |
| Intake | `reference/intake.md` | approving `design/brief.md` |
| 1 · References | `reference/stage-1-references.md` | shortlisting N styles in the gallery (default 5) |
| 2 · Directions | `reference/stage-2-directions.md` | naming a winner (+ features to borrow) |
| 3 · Iterations | `reference/stage-3-iterations.md` | picking pieces from each iteration |
| 4 · Final | `reference/stage-4-final.md` | receiving the final build, DESIGN.md and decision log |

Read a stage's reference file when you enter that stage, not before. Every build, at every stage,
is dispatched with `reference/build-prompt.md` and obeys `reference/constants.md`.

## Scripts

`<skill-dir>` is the directory containing this file. Run with `python3 -I`, cwd at the user's project.

| Command | Does |
|---|---|
| `python3 -I <skill-dir>/scripts/check_deps.py --project .` | finds impeccable, tasteskill, node, python3, a Chromium browser; prints install commands for missing skills |
| `python3 -I <skill-dir>/scripts/scaffold.py .` | creates `design/` (brief, decisions, switcher, gallery); never overwrites |
| `python3 -I <skill-dir>/scripts/manifest.py .` | rebuilds `design/manifest.js` from build folders + `meta.json` |
| `python3 -I <skill-dir>/scripts/serve.py . --port 8000` | serves `design/` on the first free port ≥ 8000 (run in background) |

## Output layout

```
design/
  brief.md · decisions.md · index.html (switcher) · manifest.js
  references/   screenshots, SOURCES.md, gallery.html, gallery-data.js
  stage-2/      <nn>-<style-slug>-<impeccable|taste>/index.html + meta.json
  stage-3/      iter-<n>/index.html + meta.json
  final/        index.html + meta.json
  DESIGN.md     (Stage 4)
```

## Counts

Defaults: shortlist 5 styles; build each with impeccable **and** tasteskill for marketing pages,
impeccable **only** for app screens (tasteskill states it is not for dashboards or app screens);
3 iterations on the winner. The user may change any count at intake or later; record changes in
`decisions.md`.

## Templates

`templates/brief.md`, `templates/decisions.md`, `templates/SOURCES.md` (copied by scaffold),
`templates/direction-block.md` (Stage 2), `templates/meta.json` (every build).
