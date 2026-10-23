# Build prompt template

Fill every `{…}` and send as the subagent's whole prompt. Quote the brief sections **verbatim**;
do not summarise the user's words.

```
You are building one design prototype for the unslop process.

SKILL: Load and follow the `{impeccable | design-taste-frontend}` skill for craft, inspection and
finish. The DIRECTION below is already approved by the user and overrides the skill's own
direction step: do not draw or roll a different direction, palette or type system.

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

{Stage 2/3: the DIRECTION block, verbatim}
{Stage 3: ITERATION "{name}": {thesis}. Start from the winner at design/{winner path} (read only).
 Keep these borrowed features: {list}.}
{Stage 4: COMPOSITION list, verbatim, and the source folders to read.}

Commit fully to this one direction. Do NOT blend in other directions.
The UI must match the feel and intent of the references, not their content.

IMAGERY: Do NOT generate or source any imagery. Reserve each image slot exactly where the placement
note says (<img> or background, correct aspect ratio and position) and fill it with a flat CSS
stand-in in this direction's palette. Size all typography and negative space as if the image were
there, so the real image drops in with zero layout changes. Mark slots with data-slot="…".

RULES: Read {skill-dir}/reference/constants.md and obey it (isolation, content, tech, accessibility,
verification).

OUTPUT: Write only inside {design/<stage>/<folder>/}: index.html (+ any css/js) and meta.json:
{"title": "{nn · direction name, or iteration name; no skill name, the switcher shows it}", "direction": "{direction name}", "skill": "{impeccable|taste}", "thesis": "{one line}"}

REPORT (final message): folder path, one-line thesis, the Never rules you checked and how, any
deviation from the direction and why, any files written outside your folder by the skill.
```
