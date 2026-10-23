# Intake

Goal: a filled-in `design/brief.md` the user has approved. Use what the user already said; ask only
for what is missing. Ask with the question tool where a short choice fits; open questions for intent.

Collect:

1. **What**: the page or screen and the product.
2. **Surface type**: `marketing` or `app-screen`. This decides whether tasteskill builds run.
3. **Audience and goal**: who, and the one job or conversion (the primary CTA for marketing pages).
4. **Intent**: how it should feel, in the user's words. Quote them; do not polish.
5. **Guardrails**: ask the user to write **Always** (constants) and **Never** (bans).
   - Do not draft or suggest the lists' contents. You may show the format.
   - If a list is empty, ask once whether that is deliberate.
   - If two rules contradict, quote both and ask which wins.
6. **Brand / design system**: ask whether one exists (tokens file, colour spec, fonts). If yes, get
   the path; every build uses it and directions vary everything else. If no, each direction picks
   its own palette and type within the guardrails.
7. **Counts**: confirm defaults (5 styles; impeccable + tasteskill or impeccable only; 3 iterations).
8. **References**: will the user provide them (files or URLs), or should Claude gather them? If
   Claude gathers, ask which sites (Dribbble, Pinterest, X, others the user names) and any to avoid.

Write `design/brief.md` from `templates/brief.md`, show it back, and get an explicit yes.
Update `decisions.md`: `stage: 1`, `waiting on: references`.

Do not read the project's root DESIGN.md or PRODUCT.md as the look to keep. Use them only if the
user names them as the brand in step 6.
