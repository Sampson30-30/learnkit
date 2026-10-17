// The blc and howdigital themes inherit their colours from the design systems.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, loadDesignSystem, loadMap, declarations, sync } from '../scripts/design-systems.mjs';

const REQUIRED = [
  'color-page', 'color-bg', 'color-surface', 'color-text', 'color-muted', 'color-border', 'color-divider',
  'color-primary', 'color-primary-text', 'color-focus', 'color-backdrop',
  'color-success', 'color-success-bg', 'color-warning', 'color-warning-bg',
  'color-danger', 'color-danger-bg', 'color-info', 'color-info-bg',
].map((k) => `--lk-${k}`);

for (const theme of THEMES) {
  const ds = loadDesignSystem(theme);
  const map = loadMap(theme);

  test(`${theme}: every design system token named in the map exists`, () => {
    for (const source of [...Object.values(map.tokens), ...Object.values(map.extra || {})]) {
      if (typeof source === 'string') assert.ok(ds.byName.has(source.replace(/^ds:/, '')), `${source} is not in ${ds.name}`);
    }
  });

  test(`${theme}: the map covers every colour a theme must set`, () => {
    for (const prop of REQUIRED) assert.ok(map.tokens[prop], `${prop} is missing from the map`);
  });

  test(`${theme}: LearnKit's own values have both modes and the design system is used wherever it can be`, () => {
    for (const [prop, source] of Object.entries(map.tokens)) {
      if (typeof source === 'object') assert.ok(source.light && source.dark, `${prop} needs light and dark`);
    }
    const fromDs = Object.values(map.tokens).filter((s) => typeof s === 'string').length;
    assert.ok(fromDs >= 12, `only ${fromDs} colours come from the design system`);
  });

  test(`${theme}: every generated colour resolves in light and dark`, () => {
    for (const mode of ['light', 'dark']) {
      for (const [prop, value] of declarations(theme, mode, ds, map)) {
        assert.match(value, /^(#[0-9a-f]{6}|rgb\([^)]+\))$/, `${prop} (${mode}) is ${value}`);
      }
    }
  });
}

test('the theme stylesheets match their design systems (run npm run sync if this fails)', () => {
  assert.deepEqual(sync({ check: true }), []);
});
