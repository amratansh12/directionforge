# Stage 3 · Iterations on the winner

1. **Restate the synthesis** in a short list: the winning build, each borrowed feature and which
   build it comes from, and anything the user asked to change.
2. **Plan N iterations** (default 3). Each is the winner taken in a different, named direction with
   a one-line thesis (e.g. "Quiet canvas: the surface and the frame share one tone; the content is
   the only lifted plane"). Iterations differ in structure and emphasis, not just colour. All keep
   the winner's direction block, the brief's guardrails and the borrowed features.
   Show the synthesis and the iteration names together; set `decisions.md` to `stage: 3 ·
   iterations`, `waiting on: user approval of synthesis and iteration names`, and wait for a yes.
3. **Build** with the **skill that made the winner** (from `decisions.md`). Same dispatch as Stage 2:
   set `waiting on: nothing (builds dispatched: <folders>)`, then one subagent per iteration with
   the filled `build-prompt.md`; the winner's folder is given as the
   starting point to read, never to edit. Output `design/stage-3/iter-<n>/` + `meta.json`.
4. Run `manifest.py .`, screenshot desktop and mobile, check against Never and constants, fix.

## Stop

Set `decisions.md` to `waiting on: user's picks from each iteration`. Give `<server>/#stage-3/0`
(the address serve.py printed). Ask the user which pieces to take from each iteration
(layout, navigation, a component, type, density, a detail). Encourage concrete picks: "iter-2's
header, iter-1's table rows".

Stop. When the user answers, log the picks in their words, and only then move to Stage 4.
