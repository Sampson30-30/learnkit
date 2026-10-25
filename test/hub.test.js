// The home page links to everything. This checks that none of those links is broken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);

function localLinks(file) {
  const html = readFileSync(new URL(file, root), 'utf8');
  const base = file.includes('/') ? file.slice(0, file.lastIndexOf('/') + 1) : '';
  return [...html.matchAll(/href="([^"#]+)"/g)]
    .map((m) => m[1])
    .filter((href) => !/^(https?:|mailto:)/.test(href))
    .map((href) => new URL(href, new URL(base, root)).pathname);
}

test('every link on the home page points at a real file or page', () => {
  const links = localLinks('index.html');
  assert.ok(links.length >= 9);
  for (const path of links) {
    const target = new URL(`.${path.replace(new URL('.', root).pathname, '/')}`, root);
    const file = path.endsWith('/') ? new URL('index.html', target) : target;
    assert.ok(existsSync(file), `broken link: ${path}`);
  }
});

test('the other pages link back to the home page', () => {
  for (const file of ['examples/index.html', 'lesson/index.html', 'lesson/architecture/index.html', 'gallery/index.html', 'customiser/index.html', 'test/browser/index.html']) {
    const html = readFileSync(new URL(file, root), 'utf8');
    assert.match(html, /class="back-link"/, `${file} has no way back`);
  }
});

test('the Rise test is one self-contained file that a person can paste into a course', async () => {
  const { Script } = await import('node:vm');
  const html = readFileSync(new URL('rise-test/index.html', root), 'utf8');
  assert.doesNotMatch(html, /<link\b/i, 'no stylesheet files');
  assert.doesNotMatch(html, /<script[^>]*\ssrc=/i, 'no script files');
  assert.doesNotMatch(html, /<img\b|<iframe\b/i, 'nothing else to fetch');
  assert.doesNotMatch(html, /\bimport\s+[^(]*from\s/, 'no module imports');
  const urls = [...html.matchAll(/https?:\/\/[^\s"'<>)]+/g)].map((m) => m[0]);
  assert.deepEqual([...new Set(urls)], ['https://example.com/'], 'the only address in it is the one network check');
  // The classic script must be valid JavaScript.
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new Script(scripts[0]));
  // It must not set display on dialog or popover elements, which would break them when closed.
  assert.doesNotMatch(html, /(dialog|#pop)\s*\{[^}]*display\s*:/);
});
