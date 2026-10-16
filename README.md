# LearnKit

Dependency-free Web Components: accessible UI primitives, plus interactive components for learning content. No framework, no build step: add a script and a stylesheet, then write HTML.

```html
<link rel="stylesheet" href="learnkit.css" />
<script type="module" src="index.js"></script>

<lk-tabs label="Course sections">
  <div data-lk-tab="Overview">Start here.</div>
  <div data-lk-tab="Details">Go deeper.</div>
</lk-tabs>
```

## Status

Version 0.1.0. Everything on the [roadmap](ROADMAP.md) is built.

**Core primitives**

| Component | Description |
| --- | --- |
| `<lk-tabs>` | Accessible tabbed content with keyboard support |
| `<lk-accordion>` | Collapsible sections, one open at a time or several |
| `<lk-modal>` | Modal dialog with focus containment and focus return |
| `<lk-tooltip>`, `<lk-popover>` | Hover and focus hints, and click-open panels |
| `toast()` | Notifications with tones, actions and reading-time durations |
| `.lk-button`, `.lk-badge` | CSS-only buttons and badges |
| `<lk-field>`, `<lk-choices>` | Labelled inputs, selects, sliders, checkbox and radio groups with validation |
| `<lk-progress>`, `<lk-stepper>` | Progress bar and step indicator |

**Display components**

| Component | Description |
| --- | --- |
| `<lk-glossary>` | Terms and meanings from a plain list, sorted A to Z with search and letter links |
| `<lk-table>` | Native table made sortable and filterable, announced to screen readers |
| `<lk-alert>`, `<lk-chip>`, `<lk-avatar>` | Messages, tags and people |
| `<lk-switch>` | On/off setting built on a native checkbox |
| `<lk-breadcrumbs>`, `<lk-pagination>` | Where you are, and moving between pages |
| `<lk-menu>`, `<lk-tree>`, `<lk-drawer>` | Action menu, collapsible outline, and a side panel |
| `.lk-card`, `.lk-divider`, `.lk-skeleton` | CSS-only surfaces and loading placeholders |

**Learning components**

| Component | Description |
| --- | --- |
| `<lk-quiz>` | Knowledge check with feedback, scoring and retry, from markup or JSON |
| `<lk-journal>` | Reflection journal that saves locally and exports as text or JSON |
| `<lk-spectrum>` | Place a view between two poles, then compare with an expert |
| `<lk-rating>` | Self-assessment scales with a summary |
| `<lk-timeline>` | Events in order, collapsible or revealed one at a time |
| `<lk-grid-explorer>` | A grid of tiles that tracks what has been explored |
| `<lk-process>` | Step-by-step walkthrough with a stepper |
| `<lk-scenario>` | Branching story from markup or JSON |
| `<lk-flashcards>` | Recall practice where missed cards come round again |
| `<lk-order>` | Put items in sequence with buttons or drag, marked in words |
| `<lk-matrix>` | Fill-in and tick-box tables, marked in words, from an ordinary table |
| `<lk-hotspot>` | Numbered points on a picture or diagram, tracking what is explored |
| `<lk-flow>` | Process chart or decision tree from nested lists, with a walk-through that marks your route |

LearnKit is a free UI shop with three layers: **components**, **themes** that give any component a complete look, and a **customiser** to make a theme your own. Available themes: `homepage`, `clean`, `contrast`, `bold`, `soft`, `blc` (the Blended Learning Consortium look) `howdigital` (the HoW Digital look) and `sankofa` (the Sankofa writer’s companion look).

## Principles

- **No dependencies and no build step.** Plain ES modules and CSS.
- **Accessible by default.** Keyboard support, ARIA roles, visible focus, reduced motion respected.
- **Themeable.** Override any `--lk-*` token, or load a whole theme. See [docs/theming.md](docs/theming.md).
- **Light DOM.** Style with ordinary CSS. Content stays readable by search engines and assistive technology.
- **Content as markup or data.** Authors do not need to write JavaScript.

## Try it

```sh
npm start        # serves the repo at http://localhost:8080
# the home page links to everything: examples, gallery, customiser, docs and tests
npm test         # unit tests for helpers, plus contrast checks for every theme
# component tests run in the browser: open /test/browser/
```

## Documentation

- [Roadmap](ROADMAP.md)
- [Getting started](docs/getting-started.md)
- [Theming](docs/theming.md)
- Theme gallery: run `npm start`, then open `/gallery/`
- Customiser: run `npm start`, then open `/customiser/`
- [Contributing](CONTRIBUTING.md)

## Licence

[MIT](LICENSE)
