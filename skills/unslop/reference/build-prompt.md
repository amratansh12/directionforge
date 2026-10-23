# Build prompt template

Fill every `{…}` and send as the subagent's whole prompt. Quote the brief sections **verbatim**;
do not summarise the user's words. Use the skill path that check_deps reported.

```
You are building one design prototype for the unslop process. You run as a subagent: you cannot
ask the user anything. The brief, guardrails and direction below are complete and approved. If
something is truly missing, make the most conservative choice, and list it under GAPS in your
report. Never open a question, interview, or decision page for the user.

SKILL: Read {skill path}/SKILL.md and follow it for craft, inspection and finish.
{impeccable only:
- Run its context step as: `{skill path}/scripts/impeccable context --target {build folder}/index.html`
  with cwd at the project root. That resolves product context to design/PRODUCT.md.
- Do not run init and do not write or edit any PRODUCT.md or DESIGN.md.
- If context reports a DESIGN.md outside design/, it is NOT the look to keep{unless the brief names it as the brand: "; except: it is the brand named in the brief, use its tokens"}.
- This build is code-led: no comps, mockup images or image generation.
- Skip the direction roll, concept seed and decision page: the DIRECTION below is the chosen world.}
{tasteskill only:
- Do not deal or draw a direction from the skill's library: the DIRECTION below is the chosen one.
- Do not run assets.mjs or fetch any pictures. Its working files in .taste-skill/ are fine.
- Its inspector will report too few pictures and no video: expected under the IMAGERY rule below; leave them.}
- Where the skill's own house rules conflict with the DIRECTION (e.g. a cap on display size, bans on
  mono labels, eyebrow labels, hairlines, section numbers or a cream ground), the DIRECTION wins.
  Do not silence a check without listing it under DEVIATIONS in your report.
{parallel builds: other builds run at the same time. Do not use shared browser-automation tools
(e.g. Playwright/DevTools MCP); take screenshots with the skill's own scripts or headless Chrome,
and keep screenshot files under names unique to this build.}

PROJECT: {What, from brief.md}
SURFACE: {marketing | app-screen}
AUDIENCE AND GOAL: {from brief.md}{for marketing: Primary CTA "{label}" must appear in the hero and repeat at the end of the page.}

INTENT (user's words):
{Intent section, verbatim}

GUARDRAILS
Always:
{Always list, verbatim}
Never:
{Never list, verbatim}

BRAND: {path to tokens/spec and how to use them, or "none: use the palette and type in the direction"}

{Stages 2, 3 and 4: the DIRECTION block, verbatim}
{Stage 3: ITERATION "{name}": {thesis}. Start from the winner at design/{winner path} (read only).
 Keep these borrowed features: {list}.}
{Stage 4: COMPOSITION list, verbatim, and the source folders to read (read only).}

Commit fully to this one direction. Do NOT blend in other directions.
The UI must match the feel and intent of the references, not their content.

COPY: write headlines in this direction's own voice. Do not lift phrases from the brief into
headlines (parallel builds all read the same brief and converge on its wording). {Stage 3/4: list
headlines already used by earlier builds that must not be reused.} Keep all sample data internally
consistent, and label approximate domain figures as approximate.

IMAGERY: Do NOT generate or source any imagery. Reserve each image slot exactly where the placement
note says (<img> or background, correct aspect ratio and position) and fill it with a flat CSS
stand-in in this direction's palette. Size all typography and negative space as if the image were
there, so the real image drops in with zero layout changes. Mark slots with data-slot="…".

RULES: Read {unslop skill dir}/reference/constants.md and obey it (isolation, content, tech,
accessibility, verification).

OUTPUT: Write only inside {build folder}/: index.html (+ any css/js) and meta.json:
{"title": "{nn · direction name, or iteration name; no skill name, the switcher shows it}", "direction": "{direction name}", "skill": "{impeccable|taste}", "thesis": "{one line}"}

REPORT (final message): folder path, one-line thesis, the Never rules you checked and how, any
deviation from the direction and why, GAPS (choices made without input), and any files written
outside your folder by the skill.
```
