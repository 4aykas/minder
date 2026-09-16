# minder

Working materials for the TEBIN · Haskoning integration brainstorm.

`.input/brief.md` is the single source of truth. The build scripts in `.build/`
read it (well, encode its content) and regenerate the visual artifacts:

- `integration-map.canvas` — an Obsidian JSON Canvas.
- `integration-map.html` / `integration-board.html` — a standalone HTML board
  rendered with the [Archify](https://github.com) Claude skill.

## Building

```bash
node .build/build-canvas.mjs
```

Regenerates `integration-map.canvas` in the repo root. Override the output
path with the `CANVAS_OUT` environment variable.

```bash
node .build/build-archify.mjs
```

Regenerates `integration-map.html`. This script shells out to a local
checkout of the Archify skill, expected by default at
`~/.claude/skills/archify`; override with `ARCHIFY_SKILL_PATH`. Override the
HTML output path with `ARCHIFY_HTML_OUT`.
