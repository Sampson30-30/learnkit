// The export bundle for Claude Design systems must be a plain, inline-safe classic script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { THEMES, bundle } from '../scripts/bundle-for-design-system.mjs';

for (const theme of THEMES) {
  const { js, css } = bundle(theme);

  test(`${theme} bundle: classic script with no imports, no network, inline-safe`, () => {
    assert.doesNotMatch(js, /^\s*(import|export)\s*(\{|\*|'|"|default\b)/m);
    assert.doesNotMatch(js, /<\/script|<!--/i);
    assert.doesNotMatch(js, /\bfetch\(|XMLHttpRequest|https?:\/\//);
    assert.doesNotThrow(() => new vm.Script(js));
    assert.match(js, /window\.LearnKit =/);
  });

  test(`${theme} bundle: stylesheet carries the base styles and the theme, no @import`, () => {
    assert.match(css, new RegExp(`data-lk-theme='${theme}'`));
    assert.match(css, /@layer lk\.tokens/);
    assert.doesNotMatch(css, /@import|url\(\s*['"]?https?:/);
  });
}
