// The site's navigation: the header's links and the index on the Examples page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { allPaths, SITE_LINKS } from '../site/links.js';
import { labelFor, groupSections, filterGroups, countItems, filterMessage, activeSection } from '../site/pieces.js';
import { SHELVES, ALL_PIECES } from '../home/catalogue.js';
import { LOOKS, MODES, DEFAULT_LOOK, isLook, isMode, readChoice, saveChoice } from '../site/look.js';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

// ---- the header ----

test('every link in the header points at a real page', () => {
  for (const path of allPaths()) {
    assert.ok(existsSync(new URL(`${path}index.html`, root)), `broken header link: "${path}"`);
  }
});

test('the header has a different id and a plain label for each link', () => {
  const ids = SITE_LINKS.map((link) => link.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const link of SITE_LINKS) assert.ok(link.label.length > 0 && link.label.length <= 20, link.label);
});

const PAGES = {
  'index.html': 'home',
  'examples/index.html': 'pieces',
  'gallery/index.html': 'looks',
  'customiser/index.html': 'make',
  'lesson/index.html': 'lessons',
  'lesson/architecture/index.html': 'lessons',
  'lesson/social-media/index.html': 'lessons',
};

test('every page carries the header, says which page it is, and keeps a plain way home without scripts', () => {
  for (const [file, current] of Object.entries(PAGES)) {
    const html = read(file);
    assert.match(html, new RegExp(`<site-nav current="${current}">`), `${file} has no header`);
    assert.match(html, /<site-nav[^>]*>\s*<p class="back-link">/, `${file} has no fallback link`);
    for (const [, src] of html.matchAll(/(?:src|href)="([^"]*site\/site[^"]*)"/g)) {
      assert.ok(existsSync(new URL(src, new URL(file, root))), `${file}: ${src} does not exist`);
    }
    assert.match(html, /site\/site-nav\.js/, `${file} does not load the header`);
    assert.match(html, /site\/site\.css/, `${file} does not load the header's styles`);
  }
});

// ---- the index on the Examples page ----

const sections = [
  { id: 'lk-sort', heading: 'lk-sort', shelf: 'check' },
  { id: 'lk-quiz', heading: 'lk-quiz', shelf: 'check' },
  { id: 'menu-tree-drawer', heading: 'Menu, tree and drawer', shelf: 'organise' },
  { id: 'mystery', heading: 'Something new', shelf: 'nowhere' },
];

test('a section that is one piece uses the plain name from the catalogue, otherwise its heading', () => {
  assert.equal(labelFor(sections[0], ALL_PIECES), 'Sort into groups');
  assert.equal(labelFor(sections[2], ALL_PIECES), 'Menu, tree and drawer');
});

test('sections are grouped by shelf in shelf order, and follow the catalogue order inside a shelf', () => {
  const groups = groupSections(sections, SHELVES, ALL_PIECES);
  assert.deepEqual(groups.map((g) => g.id), ['check', 'organise', 'more']);
  assert.deepEqual(groups[0].items.map((i) => i.id), ['lk-quiz', 'lk-sort'], 'the catalogue puts Quiz before Sort');
});

test('a section with an unknown shelf goes under More, and empty shelves are left out', () => {
  const groups = groupSections(sections, SHELVES, ALL_PIECES);
  assert.equal(groups.at(-1).title, 'More');
  assert.deepEqual(groups.at(-1).items.map((i) => i.id), ['mystery']);
  assert.ok(!groups.some((g) => g.id === 'story' || g.id === 'collect'));
});

test('typing narrows the index to items containing every word, ignoring capitals', () => {
  const groups = groupSections(sections, SHELVES, ALL_PIECES);
  assert.equal(countItems(filterGroups(groups, '')), 4);
  assert.equal(countItems(filterGroups(groups, 'SORT')), 1);
  assert.equal(countItems(filterGroups(groups, 'sort groups')), 1);
  assert.equal(countItems(filterGroups(groups, 'sort banana')), 0);
});

test('the filter also finds a piece by what it does or by the name to ask Claude for', () => {
  const groups = groupSections(sections, SHELVES, ALL_PIECES);
  assert.equal(countItems(filterGroups(groups, 'lk-quiz')), 1);
  assert.ok(countItems(filterGroups(groups, 'dragging')) >= 1, 'found through its plain description');
});

test('the status line says how many pieces there are, and what a search found', () => {
  assert.equal(filterMessage(29, 29, ''), '29 pieces');
  assert.equal(filterMessage(3, 29, 'sort'), 'Showing 3 of 29.');
  assert.equal(filterMessage(0, 29, ' xyz '), 'No pieces match “xyz”.');
});

test('every example section says which shelf it belongs to, and the shelf exists', () => {
  const html = read('examples/index.html');
  const tags = [...html.matchAll(/<section class="ex" id="([^"]+)"([^>]*)>/g)];
  assert.ok(tags.length >= 29, 'the example sections were found');
  const shelves = new Set(SHELVES.map((s) => s.id));
  for (const [, id, rest] of tags) {
    const shelf = rest.match(/data-shelf="([^"]+)"/)?.[1];
    assert.ok(shelf, `section "${id}" has no data-shelf`);
    assert.ok(shelves.has(shelf), `section "${id}" is on an unknown shelf "${shelf}"`);
  }
});

test('the piece being read is the last one whose top has reached the line', () => {
  const tops = (...values) => values.map((top, i) => ({ id: `s${i}`, top }));
  assert.equal(activeSection(tops(-900, -300, 200, 700), 250), 's2');
  assert.equal(activeSection(tops(-900, -300, 200, 700), 100), 's1');
  assert.equal(activeSection(tops(-10, 400, 900), 250), 's0');
  assert.equal(activeSection(tops(300, 800), 250), 's0', 'before the first piece, the first is marked');
  assert.equal(activeSection([], 250), null);
});

// ---- the look and mode menus ----

const fakeStorage = (items = {}) => ({ getItem: (k) => (k in items ? items[k] : null), setItem: (k, v) => { items[k] = String(v); }, items });

test('the header offers every look the gallery has, and three modes', () => {
  assert.equal(LOOKS.length, 10);
  assert.ok(isLook('') && isLook('clean') && isLook('sankofa') && isLook('monokai'), 'the built-in look and the themes');
  assert.ok(!isLook('neon'));
  assert.deepEqual(MODES.map((m) => m.id), ['', 'light', 'dark']);
  assert.ok(isMode('dark') && !isMode('sepia'));
  assert.equal(LOOKS.find((l) => l.id === 'blc').name, 'BLC', 'a short name for the long one');
});

test('nothing saved means the page keeps its own look and follows the device', () => {
  assert.deepEqual(readChoice(fakeStorage()), { look: DEFAULT_LOOK, mode: '' });
  assert.deepEqual(readChoice(fakeStorage(), 'bold'), { look: 'bold', mode: '' });
});

test('a saved choice is read back, including the built-in look, which is an empty value', () => {
  const store = fakeStorage();
  saveChoice(store, { look: 'sankofa', mode: 'dark' });
  assert.deepEqual(readChoice(store), { look: 'sankofa', mode: 'dark' });
  saveChoice(store, { look: '', mode: '' });
  assert.deepEqual(readChoice(store), { look: '', mode: '' });
});

test('an unknown saved value is ignored, so an old or edited value cannot break a page', () => {
  assert.deepEqual(readChoice(fakeStorage({ 'lk-site-look': 'neon', 'lk-site-mode': 'sepia' })), { look: DEFAULT_LOOK, mode: '' });
});

test('storage that is missing or refuses to work never throws', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(readChoice(broken), { look: DEFAULT_LOOK, mode: '' });
  assert.deepEqual(readChoice(null), { look: DEFAULT_LOOK, mode: '' });
  assert.doesNotThrow(() => saveChoice(broken, { look: 'bold', mode: 'dark' }));
  assert.doesNotThrow(() => saveChoice(null, { look: 'bold', mode: 'dark' }));
});

test('every page says which look it starts in, so the choice always has somewhere to start', () => {
  for (const file of Object.keys(PAGES)) {
    const html = read(file);
    assert.match(html.slice(0, html.indexOf('>', html.indexOf('<html')) + 1), /data-lk-theme="clean"/, `${file} does not start in a look`);
  }
});

test('the gallery and customiser take their page colours from the theme, not a palette of their own', () => {
  for (const file of ['gallery/gallery.css', 'customiser/customiser.css']) {
    const css = read(file);
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(/, `${file} still hard-codes a colour`);
  }
});

// ---- the header stays in view ----

test('the header is sticky, and everything else that sticks to the top sits below it', () => {
  assert.match(read('site/site.css'), /site-nav \{[^}]*position: sticky;[^}]*top: 0;/, 'the header sticks to the top');
  assert.match(read('site/site.css'), /scroll-padding-top: calc\(var\(--site-nav-height/, 'links to a place on the page do not land underneath it');
  const below = {
    'lesson/lesson.css': /\.top \{[^}]*top: var\(--site-nav-height/,
    'gallery/gallery.css': /\.controls \{[^}]*top: var\(--site-nav-height/,
    'customiser/customiser.css': /\.preview-wrap \{[^}]*top: calc\(var\(--site-nav-height/,
    'examples/index.html': /examples-layout__index \{[^}]*top: calc\(var\(--site-nav-height/,
  };
  for (const [file, pattern] of Object.entries(below)) assert.match(read(file), pattern, `${file} would slide under the header`);
  assert.match(read('examples/index.html'), /\.ex__notes \{[^}]*top: calc\(var\(--site-nav-height/);
});

test('no page pins something to the top with a fixed offset that ignores the header', () => {
  for (const file of ['lesson/lesson.css', 'gallery/gallery.css', 'customiser/customiser.css', 'examples/index.html']) {
    const css = read(file);
    for (const [, rule] of css.matchAll(/position: sticky;([^}]*)/g)) {
      assert.match(rule, /--site-nav-height/, `${file}: a sticky rule ignores the header: "${rule.trim().slice(0, 60)}"`);
    }
  }
});
