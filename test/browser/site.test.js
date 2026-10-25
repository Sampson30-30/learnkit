import { test, assert, equal, mount, click, press } from './harness.js';
import '../../site/site-nav.js';
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
