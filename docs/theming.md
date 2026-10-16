# Theming

LearnKit separates what a component does from how it looks. Components provide structure and behaviour. Themes provide the look.

There are three ways to change appearance, from lightest to heaviest:

1. **Override tokens.** Change a few `--lk-*` custom properties.
2. **Use a theme.** Load a ready-made theme stylesheet and set `data-lk-theme`.
3. **Write a theme.** Set the tokens and add rules for the parts that tokens cannot reach, such as bevels or unusual tab shapes.

## 1. Override tokens

Override them on `:root` for the whole page, or on any wrapper to theme one section.

```css
:root {
  --lk-color-primary: #0b7a53;
  --lk-radius: 2px;
}

.dark-section {
  --lk-color-bg: #101418;
  --lk-color-text: #f1f3f5;
}
```

### Token contract

Every theme sets these. Components only ever read these, so a theme that sets them all works with every component.

| Token | Purpose |
| --- | --- |
| `--lk-font` | Body font stack |
| `--lk-font-heading` | Heading font stack (defaults to `--lk-font`) |
| `--lk-color-page` | The page behind components |
| `--lk-color-bg` | Component background |
| `--lk-color-surface` | Raised or secondary surfaces, such as a tab bar |
| `--lk-color-text` | Body text |
| `--lk-color-muted` | Secondary text |
| `--lk-color-border` | Borders that define a control or container |
| `--lk-color-divider` | Decorative dividers inside a component |
| `--lk-color-primary` | Accent and selected states |
| `--lk-color-primary-text` | Text on top of the primary colour |
| `--lk-color-focus` | Focus ring |
| `--lk-radius` | Corner radius for containers |
| `--lk-radius-control` | Corner radius for buttons, tabs and inputs |
| `--lk-border-width` | Border width |
| `--lk-shadow` | Box shadow for raised containers (`none` by default) |
| `--lk-space` | Base spacing |
| `--lk-transition` | Transition timing (set to `0ms` when the user prefers reduced motion) |

Dark mode follows `prefers-color-scheme` by default. To force a mode, set `data-lk-mode="light"` or `data-lk-mode="dark"` on `<html>` or on any wrapper.

## 2. Use a theme

Themes live in `src/themes/`. Load `learnkit.css` first, then the theme, then set the attribute.

```html
<link rel="stylesheet" href="learnkit.css" />
<link rel="stylesheet" href="themes/homepage.css" />

<html data-lk-theme="homepage">
```

Put the attribute on a wrapper instead of `<html>` to theme one section, or to show several themes on the same page. Set `data-lk-mode` on the same element as `data-lk-theme`.

To see every component in every theme, run `npm start` and open `/gallery/`. It can show one component across all themes, or one theme across all components, in light, dark or system mode, and the address keeps your choices so you can share a view.

## Customiser

To make your own variation of a theme without writing CSS, run `npm start` and open `/customiser/`. Pick a theme to start from, then change colours (separately for light and dark), corner radius, border width, spacing, shadow and fonts. The preview updates as you go, and every colour pair is checked against the same contrast rules as `npm test`, with a clear pass or fail. When you are done, copy the CSS or download `customisation.css`. It contains only what you changed, so load it after `learnkit.css` and the theme file. Your work in progress is kept in your browser.

Available themes:

| Theme | Look |
| --- | --- |
| `homepage` | Mid 1990s document web rebuilt with modern CSS: system fonts, square panels, bevelled controls, hard offset shadow. Light (paper) and dark (night). |
| `clean` | Quiet and modern: rounded corners, soft layered shadows, pill tabs, plus and minus markers, teal on cool neutrals. Light and dark. |
| `contrast` | High contrast: black and white with 2px outlines, no shadows, underlined hover states. Text meets WCAG AAA (7:1). Dark mode is yellow and cyan on black. |
| `bold` | Loud and playful: thick black outlines, flat saturated colour, heavy headings, hard shadows that buttons press into. Yellow page in light, near black in dark. |
| `soft` | Gentle and friendly: generous rounding and spacing, a rounded font, warm neutrals, berry accent, soft shadows. |
| `howdigital` | The HoW Digital look, from the HoW Digital design system: dark ink, coral pill tabs with ink text, rounded panels, ink dialog headers. Light and dark. |
| `sankofa` | The Sankofa writer’s companion look, from the Sankofa design system: warm paper and brown ink, indigo actions, serif text, sans-serif controls at least 48px tall, no shadows. Light and dark, both warm. |
| `blc` | The Blended Learning Consortium look, from the BLC design system: white and warm grey, charcoal text, BLC pink accent, 8px corners, controls at least 44px tall. Light and dark. |

**Fonts for `blc` and `howdigital`.** The themes ask for Raleway (headings) and Source Sans 3 (body) but do not load them, so nothing is fetched from the internet and a course works offline. Without them it uses the system font. To use the real fonts, add this to the page, or host the font files yourself:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&family=Source+Sans+3:wght@400;700&display=swap" />
```

**Fonts for `sankofa`.** The theme asks for Noto Serif (reading) and Noto Sans (controls), chosen because they show African-language text, including stacked tone marks, well. They are not loaded, so without them the page uses Georgia and the system font, which may draw some tone marks less well. To use them, add this to the page, or host the font files yourself:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600&family=Noto+Sans:wght@400;600&display=swap" />
```

## 3. Write a theme

A theme is one CSS file in `src/themes/<name>.css`. Start from `clean.css` or `soft.css`, which are mostly tokens, or `homepage.css` if your theme needs extra rules. A theme made only of tokens already works for every component.

1. Wrap everything in `@layer lk.theme { ... }`. LearnKit declares the layer order `lk.tokens, lk.components, lk.theme`, so a theme beats component styles without needing higher specificity.
2. Scope every selector to `[data-lk-theme='<name>']`, so the theme only applies where asked and several themes can share a page.
3. Set every token in the contract above, for light and dark. Dark goes in two places: a `prefers-color-scheme: dark` block guarded with `:not([data-lk-mode='light'])`, and a `[data-lk-mode='dark']` block.
4. Add rules for anything tokens cannot express. Target the component's classes, which are the public styling API (for example `.lk-tabs__tab` and `.lk-tabs__panel`). State comes from ARIA attributes such as `[aria-selected='true']`.
5. Component rules sometimes assume a shape. For example, tabs round only their top corners by default, so a pill-shaped theme sets `border-radius` on `.lk-tabs__tab` itself. Override in the theme, not in the component.
6. Prefix any extra tokens your theme invents with `--lk-<name>-` (for example `--lk-hp-bevel-light`), so they cannot clash with the contract.

`npm test` checks every theme file in `src/themes/` automatically, in light and dark: all the tokens must be present, text must reach 4.5:1 on every surface, the accent must reach 4.5:1 on the page and on raised surfaces, the focus ring 3:1, and each status colour 4.5:1 on its tint. A theme called `contrast` is held to 7:1 for text.

CSS you write outside any layer always wins over LearnKit and themes, so page-level tweaks never need `!important`.

## Accessibility note

If you change colours, keep text contrast at WCAG AA (4.5:1 for body text, 3:1 for large text and control borders) and keep the focus ring clearly visible against every surface it can sit on.
