# Stage 0 · Setup

1. Run `python3 -I <skill-dir>/scripts/check_deps.py --project .`.
2. Needed:
   - **impeccable**: always.
   - **design-taste-frontend** (tasteskill): only for marketing/landing briefs. If the surface type
     is not known yet, check now and install later if needed.
   - **python3** (scripts, local server) and **node** (both skills' installers and scripts).
   - A Chromium-family browser: tasteskill's inspector uses a local Chrome/Edge/Chromium.
3. If something is missing, tell the user exactly what will be installed and where, and **ask
   before installing**. These write into the project or the user's home folder.

   | Skill | Command (verified against upstream docs on 2026-10-23; re-check if it fails) |
   |---|---|
   | impeccable | `npx impeccable install` from the project folder, choose Claude Code (Node ≥ 18.19). Teams: `git submodule add https://github.com/pbakaus/impeccable vendor/impeccable` then `npx impeccable link --source=vendor/impeccable --providers=claude` |
   | tasteskill | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`, or inside Claude Code `/plugin marketplace add Leonxlnx/taste-skill` then `/plugin install taste-skill@taste-skill` |

   Installers may require a Claude Code reload before the skill is available. Say so and continue
   after the reload; `decisions.md` lets the next session resume.
4. Node versions: impeccable documents Node ≥ 18.19. tasteskill's own scripts may need a newer Node
   (check its SKILL.md/README for its stated floor). If the installed Node is below a floor, tell
   the user rather than upgrading anything yourself.
5. Run `python3 -I <skill-dir>/scripts/scaffold.py .` and report which files were created and which
   already existed.
6. Record each skill's version (from check_deps) under **Skill versions** in `design/decisions.md`.
