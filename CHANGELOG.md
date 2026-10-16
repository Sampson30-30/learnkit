# Changelog

All notable changes are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - Unreleased

### Fixed
- Customiser: the sticky preview no longer slides over the contrast checks or traps the scroll wheel. Contrast and export now sit below the whole layout, and a live contrast summary sits beside the preview. A browser test covers it.
- `lk-stepper` with many steps or long names no longer squashes its labels: it goes compact (current label only, others kept for screen readers) when there are more than five steps.

### Added
- `howdigital` theme: the HoW Digital look, built from the HoW Digital design system in Claude Design. Dark ink with the four bright accents, coral pill tabs with ink text, rounded panels and ink dialog headers. The design system has no dark mode or status colours, so those are LearnKit's own choices. Names Raleway and Source Sans 3 but does not load them. Contrast-checked in light and dark.
- `blc` theme: the Blended Learning Consortium look, built from the BLC design system in Claude Design. White and warm grey surfaces, charcoal text, BLC pink as the accent, 8px corners, 44px-tall controls, and the BLC CRM's own dark colours. Names Raleway and Source Sans 3 but does not load them. Status colours are LearnKit's own, as the design system has none. Contrast-checked in light and dark.
- `<lk-glossary>`: a list of terms and meanings, sorted A to Z, with a search box and jump links for each letter. Written as an ordinary `<dl>`, so it reads without JavaScript. Logic in `core/glossary.js`.
- `<lk-matrix>`: turns an ordinary table into a fill-in or tick-box activity. Cells are marked in the markup with `data-answer` (several answers allowed with `|`) or `data-tick`. Boxes are named by their row and column, marks are written in words, and there is an optional "Show answers" button. Logic in `core/matrix.js`.
- A new home page that works as a shop-front for the library: what LearnKit does in four plain points, a sample to try straight away, every piece working live on five shelves grouped by what it is for (`home/catalogue.js`), and the five looks side by side. The area for the person who looks after the code is now folded away at the bottom. A test checks that every piece in the gallery is on exactly one shelf, so a new piece cannot be forgotten.
- `.lk-guide`, a plain-English "About this page" panel built on a native `<details>`, now at the top of the home page, gallery, customiser and examples, with plain-English wording across them. A test keeps the helper text free of developer jargon and its sentences short.
- `rise-test/`: one self-contained page that checks which browser features work inside a Rise course (the `hidden` attribute, dialogs, popovers, custom elements, modules, storage, modern CSS, clipboard, resizing, network), and writes a plain-text report to send back. Nothing runs against the internet unless a button is pressed.
- `<lk-flow>`: a process chart or decision tree drawn from nested lists, with branches that rejoin, a `tree` layout, and an optional walk-through that highlights the route. Graph and walk logic in `core/flow.js`.
- Navigation components: `<lk-menu>` (dropdown with arrow keys, type-ahead and top-layer placement), `<lk-tree>` (WAI-ARIA tree with roving focus, for course outlines) and `<lk-drawer>` (a modal dialog docked to one side). Logic in `core/keys.js`, `core/tree.js` and `alignedPosition` in `core/position.js`.
- Learning components: `<lk-flashcards>` (missed cards come round again), `<lk-order>` (put items in sequence, with buttons, drag and word-based marking) and `<lk-hotspot>` (numbered points on a picture or diagram). Logic in `core/flashcards.js`, `core/order.js` and `core/spots.js`.
- Display components, modelled on the MudBlazor catalogue: `<lk-table>` (sort, filter, striped), `<lk-alert>`, `<lk-chip>`, `<lk-avatar>`, `<lk-switch>`, `<lk-breadcrumbs>`, `<lk-pagination>`, and CSS-only `.lk-card`, `.lk-divider` and `.lk-skeleton`. Logic in `core/table.js` and `core/widgets.js`.
- Project foundation: `LkElement` base class, utilities, design tokens and base stylesheet.
- `<lk-tabs>` component.
- `<lk-accordion>` component, with Homepage theme styling.
- `<lk-modal>` component, built on native `<dialog>`, with Homepage theme styling.
- Theme structure: cascade layers (`lk.tokens`, `lk.components`, `lk.theme`), `data-lk-theme` and `data-lk-mode` attributes, and a wider token contract.
- `homepage` theme, based on the Homepage design system.
- `<lk-timeline>`, `<lk-grid-explorer>`, `<lk-process>` and `<lk-scenario>`.
- `<lk-spectrum>` comparison spectrum and `<lk-rating>` self-assessment.
- `<lk-journal>` reflection journal with autosave, copy and download.
- `<lk-quiz>` knowledge check from markup or JSON, with scoring logic in `core/quiz.js`.
- `toast()` and `<lk-toasts>` notifications.
- `<lk-tooltip>` and `<lk-popover>`, with `core/position.js` for placement.
- `<lk-progress>` and `<lk-stepper>`.
- `<lk-field>` and `<lk-choices>` form controls with labels, hints, errors and validation.
- `.lk-button` and `.lk-badge` classes, status colour tokens (`success`, `warning`, `danger`, `info`), and `core/contrast.js`.
- Node tests that check every theme's contrast in light and dark, and an in-browser component test runner (`test/browser/`).
- Customiser at `/customiser/`: start from any theme, edit tokens with a live preview and contrast checks, export CSS. Export logic in `core/customise.js`.
- Theme gallery at `/gallery/`, and `data-lk-mode="light"` plus `color-scheme` so native controls follow the mode.
- `contrast` (AAA), `bold` and `soft` themes.
- `clean` theme: a modern, rounded look in light and dark, added with no component changes.
- Examples, documentation and unit tests for core helpers.
