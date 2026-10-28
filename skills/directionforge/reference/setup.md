# Stage 0 · Setup

1. Run `python3 -I <skill-dir>/scripts/check_deps.py --project .`.
2. Needed:
   - **impeccable**: always. **design-taste-frontend** (tasteskill): for marketing/landing briefs;
     if the surface type is not known yet, check now and install once it is.
   - **python3** (scripts, local server) and **node** (both skills' installers and scripts).
   - A Chromium-family browser: tasteskill's inspector uses a local Chrome/Edge/Chromium.
3. If a skill is missing, tell the user exactly what will be installed and where, and **ask before
   installing**: these write into the project. Use the non-interactive forms (the plain commands
   stop at prompts Claude cannot answer from a shell):

   | Skill | Command (run from the project folder; verified 2026-10-23, versions pinned 2026-10-28; re-check upstream if it fails) |
   |---|---|
   | impeccable | `npx -y impeccable@4.8.0 install --project --providers=claude -y` (Node ≥ 18.19) |
   | tasteskill | `npx -y skills@1.7.4 add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend --agent claude-code --copy -y` |

   Both install into `.claude/` in the project (impeccable also adds agents and hooks there;
   tasteskill adds `skills-lock.json` at the root). If the user prefers a global install, impeccable
   takes `--global` instead of `--project`, and `skills add` takes `-g`.

   A skill installed during this session may not appear in the session's skill list until Claude
   Code reloads. Builds still work: build prompts tell each subagent to read the skill's SKILL.md
   from the path check_deps reports. Mention the reload to the user once.
4. Node versions: impeccable documents Node ≥ 18.19; tasteskill's inspector documents Node 22+
   (its lint script runs on 18+). If Node is below a floor, tell the user; do not upgrade anything.
5. Run `python3 -I <skill-dir>/scripts/scaffold.py .` and report what was created and what already
   existed.
6. Re-run check_deps and record each skill's path and version under **Skill versions** in
   `design/decisions.md`.
