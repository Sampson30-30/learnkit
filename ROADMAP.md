# Roadmap

LearnKit is a free UI shop: a set of components that are not the standard UI libraries, plus a way to pick a look and make it your own. It has three layers.

- **Components** do the work. Core primitives are general-purpose and usable on any site. Learning components are built on top of them and are what make the library distinctive.
- **Themes** are complete skins. Any component can wear any theme.
- **Customiser** helps people choose a theme and adjust it to suit them.

Everything below is built (see the checked items). It is kept as a record of the plan, and a starting point for what comes next.

## Layer 1: Core primitives

- [x] Tabs
- [x] Accordion
- [x] Modal dialog (focus trapping, Escape to close, focus return)
- [x] Tooltip and popover
- [x] Toast notifications
- [x] Buttons and badges
- [x] Form controls: text field, select, checkbox and radio groups, slider
- [x] Progress bar and stepper

## Layer 2: Learning components

- [x] Quiz and knowledge check
- [x] Reflection journal with export
- [x] Comparison spectrum
- [x] Rating or self-assessment tool
- [x] Timeline
- [x] Grid explorer
- [x] Step-by-step process
- [x] Scenario or branching

## Layer 3: Themes and customisation

- [x] Theme structure: cascade layers, `data-lk-theme` and `data-lk-mode`, token contract (see [docs/theming.md](docs/theming.md))
- [x] Theme: Homepage (mid 1990s document web, light and dark)
- [x] A second theme that looks very different from Homepage (`clean`). This was the test that components are skin-agnostic. It needed no component changes.
- [x] More themes (`contrast`, `bold`, `soft`), each documented and contrast-checked in light and dark
- [x] Theme gallery: a static page showing every component in every theme, side by side (`/gallery/`)
- [x] Customiser: pick a theme, change tokens with live preview, warn on failing contrast, export the CSS (`/customiser/`)

## Added since the first plan

- [x] More components: table, glossary, alert, chip, avatar, switch, breadcrumbs, pagination, menu, tree, drawer, flashcards, order, fill-in table (`lk-matrix`), hotspot and flow chart. See the [README](README.md).
- [x] Themes from the design systems in Claude Design: `blc`, `howdigital` and `sankofa`, alongside `homepage`. Each is contrast-checked in light and dark.
- [x] A shop-front home page, an examples page with ideas beside each component, and a Rise compatibility test.

## Build order followed

1. Accordion and modal, to prove the primitives pattern beyond tabs.
2. The second theme (`clean`) as soon as there were two components, to prove the skin split.
3. Buttons, form controls, progress, tooltips and toasts, then the learning components, each with a browser test.
4. More themes, the gallery, and finally the customiser, once the token contract was stable.

## Shared decisions

- **Naming:** `lk-` tag prefix, attributes for simple configuration, properties for data, `lk-*` events.
- **Accessibility:** target WCAG 2.1 AA. Each component documents its keyboard and screen reader behaviour.
- **Theming:** components read only `--lk-*` tokens. Anything tokens cannot express (bevels, unusual shapes) goes in a theme file, using the component's classes as the public styling API. Learning components inherit the look of the primitives.
- **Layers and scoping:** LearnKit CSS lives in `lk.tokens`, `lk.components` and `lk.theme` cascade layers. Themes are scoped by `data-lk-theme`, so several can share a page.
- **Content as data:** learning components accept JSON as well as markup, so tooling can be built on top later.
- **Testing:** Node tests for logic, plus a browser test for each component.
- **No dependencies and no build step** for consumers. The gallery and customiser are plain HTML, CSS and JavaScript too.
