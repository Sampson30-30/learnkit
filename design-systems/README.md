# Design systems

The originals live in Claude Design. LearnKit's `blc` and `howdigital` themes inherit their colours from them.

| File | What it is |
| --- | --- |
| `<theme>.tokens.json` | A copy of the design system's `project/tokens.json`. Never edit it here. |
| `<theme>.map.json` | Which design system token feeds each `--lk-*` colour, and LearnKit's own values where the design system has none. |
| `sources.json` | Which design system and version each copy came from. |

## Updating a theme

1. Change the colour in the design system.
2. Copy the design system's `tokens.json` over `<theme>.tokens.json` and update its entry in `sources.json`.
3. Run `npm run sync`, then `npm test`.

If a new design system colour should feed a LearnKit colour, change the map in step 3 first.
