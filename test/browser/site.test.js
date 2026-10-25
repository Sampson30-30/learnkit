import { test, assert, equal, mount, click, press } from './harness.js';

// The header applies the look saved in this browser as soon as it loads. Clear it first,
// so what a person picked earlier cannot change what these tests see.
for (const key of ['lk-site-look', 'lk-site-mode']) localStorage.removeItem(key);
await import('../../site/site-nav.js');
import { buildPiecesIndex } from '../../site/pieces-index.js';
import { SHELVES, ALL_PIECES } from '../../home/catalogue.js';

// ---- site-nav ----

const NAV = `<site-nav current="pieces"><p class="back-link"><a href="../">Back</a></p></site-nav>`;

test('site-nav: replaces the fallback link with a named navigation landmark', async () => {
  const el = await mount(NAV);
  assert(!el.querySelector('.back-link'), 'the fallback is replaced');
  const nav = el.querySelector('nav');
  equal(nav.getAttribute('aria-label'), 'Site');
  equal([...nav.querySelectorAll(':scope > a, .site-nav__list > li > a')].map((a) => a.textContent), ['LearnKit', 'Pieces', 'Looks', 'Make your own']);
});

test('site-nav: marks the page you are on, and only that page', async () => {
  const el = await mount(NAV);
  const here = [...el.querySelectorAll('[aria-current=page]')];
  equal(here.map((a) => a.textContent), ['Pieces']);
  const home = await mount(`<site-nav current="home"></site-nav>`);
  equal([...home.querySelectorAll('[aria-current=page]')].map((a) => a.textContent), ['LearnKit']);
});

test('site-nav: Lessons is a menu of the three lessons, opened from its button', async () => {
  const el = await mount(NAV);
  const menu = el.querySelector('lk-menu');
  equal(menu.querySelector('.lk-menu__trigger').textContent.replace(/\s+/g, ' ').trim().startsWith('Lessons'), true);
  equal([...menu.querySelectorAll('a[data-lk-item]')].map((a) => a.textContent), ['Git and GitHub', 'How a project fits together', 'The Social Media Challenge']);
  click(menu.querySelector('.lk-menu__trigger'));
  assert(menu.querySelector('.lk-menu__trigger').getAttribute('aria-expanded') === 'true', 'opens');
});

test('site-nav: every link goes somewhere under the site, whatever depth the page is at', async () => {
  const el = await mount(NAV);
  const root = new URL('../../', import.meta.url).href;
  for (const a of el.querySelectorAll('a')) assert(a.href.startsWith(root), `${a.textContent} points outside the site: ${a.href}`);
});

// ---- the index on the Examples page ----

const SECTIONS = [
  { id: 'lk-sort', heading: 'lk-sort', shelf: 'check' },
  { id: 'lk-quiz', heading: 'lk-quiz', shelf: 'check' },
  { id: 'lk-tabs', heading: 'lk-tabs', shelf: 'organise' },
];

test('index: lists every piece under its shelf, in catalogue order, as links to the page sections', async () => {
  const { element } = buildPiecesIndex(SECTIONS, SHELVES, ALL_PIECES);
  document.body.append(element);
  try {
    equal([...element.querySelectorAll('.pieces-index__shelf')].map((p) => p.textContent), ['Check understanding', 'Organise content']);
    equal([...element.querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href')]), [['Quiz', '#lk-quiz'], ['Sort into groups', '#lk-sort'], ['Tabs', '#lk-tabs']]);
    equal(element.querySelector('summary').textContent, 'Jump to a piece (3)');
    equal(element.querySelector('.pieces-index__status').textContent, '3 pieces');
  } finally {
    element.remove();
  }
});

test('index: typing narrows the list and says how many are left', async () => {
  const { element, input } = buildPiecesIndex(SECTIONS, SHELVES, ALL_PIECES);
  document.body.append(element);
  try {
    input.value = 'sort';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    equal([...element.querySelectorAll('a')].map((a) => a.textContent), ['Sort into groups']);
    equal(element.querySelector('.pieces-index__status').textContent, 'Showing 1 of 3.');
    assert(element.querySelectorAll('.pieces-index__shelf').length === 1, 'shelves with no match disappear');
    input.value = 'banana';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    equal(element.querySelector('.pieces-index__status').textContent, 'No pieces match “banana”.');
    equal(element.querySelectorAll('a').length, 0);
  } finally {
    element.remove();
  }
});

test('index: the piece being read is marked, and the mark survives a new search', async () => {
  const { element, input, mark } = buildPiecesIndex(SECTIONS, SHELVES, ALL_PIECES);
  document.body.append(element);
  try {
    mark('lk-sort');
    equal([...element.querySelectorAll('[aria-current=true]')].map((a) => a.textContent), ['Sort into groups']);
    input.value = 'sort';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    equal([...element.querySelectorAll('[aria-current=true]')].map((a) => a.textContent), ['Sort into groups']);
    mark('lk-tabs');
    equal(element.querySelectorAll('[aria-current=true]').length, 0, 'a piece that is filtered out has no link to mark');
  } finally {
    element.remove();
  }
});

// ---- the look and mode menus ----

/** Runs a test with the page's look, mode and saved choice put back afterwards. */
async function withLook(fn) {
  const root = document.documentElement;
  const before = { theme: root.getAttribute('data-lk-theme'), mode: root.getAttribute('data-lk-mode'), look: localStorage.getItem('lk-site-look'), saved: localStorage.getItem('lk-site-mode') };
  const added = [...document.querySelectorAll('link[rel=stylesheet]')];
  try {
    await fn(root);
  } finally {
    for (const [attr, value] of [['data-lk-theme', before.theme], ['data-lk-mode', before.mode]]) {
      if (value === null) root.removeAttribute(attr);
      else root.setAttribute(attr, value);
    }
    for (const [key, value] of [['lk-site-look', before.look], ['lk-site-mode', before.saved]]) {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    for (const link of document.querySelectorAll('link[rel=stylesheet]')) if (!added.includes(link)) link.remove();
  }
}

const menu = (el, name) => [...el.querySelectorAll('.site-nav__look select')].find((s) => s.previousElementSibling.textContent === name);
const choose = (select, value) => {
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
};

test('look menus: Look and Mode are labelled menus, and Look lists every look', async () => {
  const el = await mount(NAV);
  assert(menu(el, 'Look') && menu(el, 'Mode'), 'both menus exist');
  equal(menu(el, 'Look').options.length, 9);
  equal([...menu(el, 'Mode').options].map((o) => o.textContent), ['Automatic', 'Light', 'Dark']);
  equal(menu(el, 'Look').labels.length, 1);
});

test('look menus: choosing a look puts it on the page, loads its stylesheet, tells listeners and is remembered', async () => {
  await withLook(async (root) => {
    const el = await mount(NAV);
    const heard = [];
    const listener = (e) => heard.push(e.detail);
    document.addEventListener('lk-sitelook', listener);
    choose(menu(el, 'Look'), 'sankofa');
    document.removeEventListener('lk-sitelook', listener);
    equal(root.getAttribute('data-lk-theme'), 'sankofa');
    assert([...document.querySelectorAll('link[rel=stylesheet]')].some((l) => l.href.endsWith('/src/themes/sankofa.css')), 'its stylesheet is loaded');
    equal(heard.at(-1).look, 'sankofa');
    equal(localStorage.getItem('lk-site-look'), 'sankofa');
  });
});

test('look menus: choosing the built-in look removes the theme, and a mode is set and cleared', async () => {
  await withLook(async (root) => {
    const el = await mount(NAV);
    choose(menu(el, 'Look'), '');
    assert(!root.hasAttribute('data-lk-theme'), 'no theme attribute');
    choose(menu(el, 'Mode'), 'dark');
    equal(root.getAttribute('data-lk-mode'), 'dark');
    choose(menu(el, 'Mode'), 'light');
    equal(root.getAttribute('data-lk-mode'), 'light');
    choose(menu(el, 'Mode'), '');
    assert(!root.hasAttribute('data-lk-mode'), 'follows the device again');
    equal(localStorage.getItem('lk-site-mode'), '');
  });
});

test('look menus: a section marked data-lk-theme="default" keeps the built-in look inside a themed page', async () => {
  const root = document.documentElement;
  const read = (el) => getComputedStyle(el).getPropertyValue('--lk-color-primary').trim();
  const kept = { theme: root.getAttribute('data-lk-theme'), mode: root.getAttribute('data-lk-mode') };
  root.removeAttribute('data-lk-theme');
  root.removeAttribute('data-lk-mode');
  const builtIn = read(root);
  root.style.setProperty('--lk-color-primary', '#ff0000');
  try {
    const plain = await mount(`<div>Inherits the page</div>`);
    const reset = await mount(`<div data-lk-theme="default">Built in</div>`);
    equal(read(plain), '#ff0000');
    equal(read(reset), builtIn);
  } finally {
    root.style.removeProperty('--lk-color-primary');
    for (const [attr, value] of [['data-lk-theme', kept.theme], ['data-lk-mode', kept.mode]]) if (value !== null) root.setAttribute(attr, value);
  }
});

// ---- the header stays in view ----

/** Loads the header's stylesheet for a test, then removes it. */
async function withSiteCss(fn) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../../site/site.css', import.meta.url).href;
  await new Promise((resolve) => {
    link.onload = resolve;
    document.head.append(link);
  });
  try {
    await fn();
  } finally {
    link.remove();
    document.documentElement.style.removeProperty('--site-nav-height');
  }
}

test('sticky header: it stays at the top and shares how tall it is', async () => {
  await withSiteCss(async () => {
    const el = await mount(NAV);
    equal(getComputedStyle(el).position, 'sticky');
    const shared = document.documentElement.style.getPropertyValue('--site-nav-height');
    equal(shared, `${el.offsetHeight}px`);
    assert(el.offsetHeight > 20, 'a real height was measured');
  });
});

test('sticky header: on a narrow screen Look and Mode fold behind a button, and on a wide one they are on show', async () => {
  const el = await mount(NAV);
  const box = el.querySelector('details.site-nav__looks');
  assert(box && box.querySelector('summary').textContent === 'Look and mode', 'there is a button for them');
  equal(box.open, matchMedia('(min-width: 40rem)').matches);
  assert(box.querySelector('select'), 'the menus are inside');
});
