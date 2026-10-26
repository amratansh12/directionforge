# Stage 2 · Directions

## 1. Draft the direction blocks

For each picked group, fill `templates/direction-block.md`. Draw thesis, type, palette, density and
the signature move from the group's references (their feel, not their content). If the brief has a
brand/design system, the palette line uses its tokens and directions differ in everything else.

Make the directions **far apart**: each `Must not` line names what it must avoid from the others.
If two picked groups are close, say so and show how the blocks keep them apart.

Set `decisions.md` to `stage: 2 · directions`, `waiting on: user approval of direction blocks`.
Show all blocks to the user. Build nothing until they approve or edit them. Save the approved blocks
to `design/stage-2/DIRECTIONS.md` and log the approval.

## 2. Build

Builds per direction:
- `marketing`: one with **impeccable**, one with **tasteskill** (`design-taste-frontend`).
- `app-screen`: **impeccable** only.

Folder: `design/stage-2/<nn>-<style-slug>-<impeccable|taste>/` with `index.html`, any CSS/JS it
needs, and `meta.json` (`title`, `direction`, `skill`, `thesis`).

Before dispatching, set `decisions.md` to `waiting on: nothing (builds dispatched: <folders>)`.
Dispatch one subagent per build, in parallel (one message, many Agent calls). Each gets the filled
`reference/build-prompt.md`: the brief's intent and guardrails verbatim, its one direction block,
its skill and its folder. **The approved direction overrides the skill's own direction step**:
tasteskill must not draw from its own direction library, and impeccable must not roll its own
visual world. The skills' craft, inspection and finishing steps still run.

When all return:
1. Check each folder has `index.html` and `meta.json`; re-dispatch any that failed.
2. Run `manifest.py .`; make sure the server is running.
3. Screenshot each build at desktop (1440) and mobile (390) widths. Check against the Never list
   and constants; fix violations (re-dispatch the build with the specific fix) before showing.

## Stop

Set `decisions.md` to `waiting on: user's winner (+ features to borrow)`. Give the switcher URL
(`<server>/#stage-2/0`, using the address serve.py printed). Ask which build wins, and whether to
borrow anything from the others (name the build and the feature). Stop.

When the user answers, log the winner, its skill and borrowed features in their words, and only
then move to Stage 3.
