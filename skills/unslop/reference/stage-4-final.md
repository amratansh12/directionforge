# Stage 4 · Final

1. **Composition list**: turn the user's picks into a numbered list, each line naming the piece and
   its source iteration, plus where pieces conflict and how you propose to resolve it. Get a yes.
2. **Build** `design/final/` with the winner's skill, using `build-prompt.md` with the composition
   list in place of a direction block (keep the direction block for the overall world). Include
   `meta.json`.
3. Run `manifest.py .`; screenshot desktop and mobile in light and dark (if the design has both);
   check against Never, constants and the composition list; fix.
4. **DESIGN.md** → `design/DESIGN.md`, describing the final build *as shipped* (read its CSS, do not
   restate intentions): colour tokens with values and roles, type families and scale, spacing and
   radii, components and their states, layout and breakpoints, reserved image slots (aspect,
   position, intended content), and the guardrails. If impeccable is installed, use its `document`
   flow or the `impeccable-documenter` agent, **with output pointed at `design/DESIGN.md`**, never
   the project root.
5. **decisions.md**: complete the log so a reader can follow every stage: picks, borrowings,
   composition, and why, in the user's words. Set `stage: done`.

## Hand over

Give the final URL (`#final/0`), the paths to `design/DESIGN.md` and `design/decisions.md`, and a
list of every file or folder written outside `design/` by the skills (e.g. `.taste-skill/`,
`.impeccable/`) so the user can keep or remove them.
