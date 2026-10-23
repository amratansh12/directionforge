# Decision log

<!-- unslop keeps this file current after every stage. A new session reads "Current stage"
     first to resume. Record the user's picks in their own words where possible. -->

## Current stage

stage: done
waiting on: nothing

## Skill versions

- impeccable: 4.7.0 (.claude/skills/impeccable)
- design-taste-frontend: tasteskill v2, skills-lock hash 69021ac7 (.claude/skills/design-taste-frontend)

## Log

<!-- One entry per decision, newest last:
### YYYY-MM-DD · Stage N · <what was decided>
- Picked: …
- Borrowed: …
- Why (user's words): …
-->

### 2026-10-23 · Intake · brief approved
- Demo run: the user asked Claude to run the demo end to end; brief, guardrails and picks are Claude's.
- Product name Kilnward checked by web search (no existing use found); 'Kiln' rejected (existing businesses).

### 2026-10-23 · Stage 1 · style picks
- 44 references from Dribbble search (9 queries), grouped into 8 visual languages.
- Picked (Claude, demo): Warm craft, Editorial serif, Swiss technical, Risograph print, Booking over photo.
- Why: Dark cinematic and Soft SaaS rely on glossy objects and gradients the Never list bans; Brutalist display fights "calm".

### 2026-10-23 · Stage 2 · directions approved
- Five direction blocks in stage-2/DIRECTIONS.md (Claude, demo).

### 2026-10-23 · Stage 2 · winner
- 10 builds done; all pass automated checks (no script errors, no fetched images, 2 reserved slots each, CTA ≥ 2, no horizontal overflow).
- Winner (Claude, demo): 03 Kiln Log · impeccable. Why: the firing curve (cone markers, quartz inversion, live NOW marker) is the clearest proof of "they understand how my week actually works".
- Borrowed: the day-by-day "In this issue" index from 02 Studio Journal · taste (as a week index); the interactive kiln capacity meter from 05 Open Studio · taste (booking pieces fills the next load).
- Weakness to address in iterations: "tactile" is under-served; copy converges on "whiteboard" phrasing across builds.

### 2026-10-23 · Stage 3 · synthesis and iteration names
- iter-1 "Kiln room wall": the log pinned up in the kiln room: warm sheet, pencil-weight annotations, tactile without leaving the technical world.
- iter-2 "One firing, start to finish": the page is one firing's timeline (book → load → fire → cool → collect); the week index is the rail.
- iter-3 "The control sheet": denser and interactive: the capacity meter beside the curve in the first screen; fewer words, more instrument.
- Skill: impeccable (winner's skill).

### 2026-10-23 · Stage 3 · picks from each iteration
- All three iterations verified in a real browser: capacity meters fill, overflow and switch sessions correctly; no script errors; no horizontal overflow at 1440.
- Picks (Claude, demo):
  1. iter-3 "The control sheet": the first screen with three instruments side by side (firing curve, capacity meter, week index).
  2. iter-1 "Kiln room wall": the warm sheet (#F5F2EB, warm grid), grease-pencil annotations (capped at 4 so the page stays calm), the headline "The week runs on the kiln's clock.", and the closing title block.
  3. iter-2 "One firing, start to finish": below the fold, sections follow one firing in order (booked → loaded → fired → cooling → unloaded), including the cooling chart and the phone-specific curve that fits without scrolling.
- Conflict resolved: iter-2's sticky time rail would duplicate iter-3's week index, so story sections carry margin timestamps instead of a rail.

### 2026-10-23 · Stage 4 · composition approved (Claude, demo)

### 2026-10-23 · Post-build edit (Claude)
- stage-2/05-open-studio-impeccable: secondary text on tinted session cards changed from #776D64 (measured 4.15:1) to #4B423B (8.06:1); header link "Sign in" relabelled "Start free trial" because it pointed at the trial section. Both found by impeccable's finish reviewer.

### 2026-10-23 · Stage 4 · final shipped
- design/final verified in a real browser: meter fill and overflow, 3 CTAs, 2 reserved slots, no external images, no script errors, no horizontal overflow at 1440 or 390.
- DESIGN.md written from the shipped CSS and markup.
- Files the skills wrote outside design/: .claude/ and skills-lock.json (installers), .taste-skill/ (tasteskill inspector output).
