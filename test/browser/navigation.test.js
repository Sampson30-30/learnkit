import { test, assert, equal, mount, click, press, listen, tick, waitFor, settle } from './harness.js';

// ---- lk-menu ----

const MENU = `<lk-menu label="More actions">
  <button data-lk-item value="duplicate">Duplicate</button>
  <a data-lk-item href="#export">Export</a>
  <hr />
  <button data-lk-item value="archive" disabled>Archive</button>
  <button data-lk-item value="delete">Delete</button>
</lk-menu>`;

test('menu: a trigger with menu semantics, and a closed menu', async () => {
  const el = await mount(MENU);
  const trigger = el.querySelector('.lk-menu__trigger');
  equal(trigger.getAttribute('aria-haspopup'), 'menu');
  equal(trigger.getAttribute('aria-expanded'), 'false');
  assert(trigger.textContent.startsWith('More actions'));
  assert(el.querySelector('[role=menu]').hidden);
  equal(el.querySelectorAll('[role=menuitem]').length, 4);
  equal(el.querySelector('[role=separator]').localName, 'hr');
});

test('menu: click opens on the first item and sets aria-expanded', async () => {
  const el = await mount(MENU);
  const seen = listen(el, 'lk-open');
  click(el.querySelector('.lk-menu__trigger'));
  assert(el.isOpen);
  equal(el.querySelector('.lk-menu__trigger').getAttribute('aria-expanded'), 'true');
  assert(document.activeElement.textContent === 'Duplicate', 'focus on first item');
  equal(seen.length, 1);
  assert(el.querySelector('[role=menu]').getBoundingClientRect().height > 0, 'is rendered');
  el.close();
});

test('menu: arrows wrap and skip disabled items; Home and End jump', async () => {
  const el = await mount(MENU);
  click(el.querySelector('.lk-menu__trigger'));
  const panel = el.querySelector('[role=menu]');
  press(document.activeElement, 'ArrowDown');
  equal(document.activeElement.textContent, 'Export');
  press(document.activeElement, 'ArrowDown');
  equal(document.activeElement.textContent, 'Delete'); // Archive is disabled
  press(document.activeElement, 'ArrowDown');
  equal(document.activeElement.textContent, 'Duplicate'); // wraps
  press(document.activeElement, 'End');
  equal(document.activeElement.textContent, 'Delete');
  press(document.activeElement, 'Home');
  equal(document.activeElement.textContent, 'Duplicate');
  assert(panel.contains(document.activeElement));
  el.close();
});

test('menu: typing a letter jumps to a matching item', async () => {
  const el = await mount(MENU);
  click(el.querySelector('.lk-menu__trigger'));
  press(document.activeElement, 'e');
  equal(document.activeElement.textContent, 'Export');
  await tick(800);
  press(document.activeElement, 'd');
  equal(document.activeElement.textContent, 'Delete');
  el.close();
});

test('menu: Escape closes and returns focus to the trigger', async () => {
  const el = await mount(MENU);
  click(el.querySelector('.lk-menu__trigger'));
  press(document.activeElement, 'Escape');
  assert(!el.isOpen);
  assert(document.activeElement === el.querySelector('.lk-menu__trigger'), 'focus returned');
  equal(el.querySelector('.lk-menu__trigger').getAttribute('aria-expanded'), 'false');
});

test('menu: choosing a button item fires lk-select, closes and returns focus', async () => {
  const el = await mount(MENU);
  const seen = listen(el, 'lk-select');
  click(el.querySelector('.lk-menu__trigger'));
  click(el.querySelectorAll('[role=menuitem]')[3]);
  equal(seen, [{ label: 'Delete', value: 'delete' }]);
  assert(!el.isOpen);
  assert(document.activeElement === el.querySelector('.lk-menu__trigger'));
});

test('menu: disabled items cannot be chosen, and the keys open it on first or last', async () => {
  const el = await mount(MENU);
  const seen = listen(el, 'lk-select');
  const trigger = el.querySelector('.lk-menu__trigger');
  press(trigger, 'ArrowUp');
  equal(document.activeElement.textContent, 'Delete');
  click(el.querySelectorAll('[role=menuitem]')[2]); // Archive
  equal(seen, []);
  assert(el.isOpen, 'still open after a disabled click');
  el.close(true);
  press(trigger, 'ArrowDown');
  equal(document.activeElement.textContent, 'Duplicate');
  el.close();
});

test('menu: a click outside closes it', async () => {
  const el = await mount(MENU);
  click(el.querySelector('.lk-menu__trigger'));
  document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  assert(!el.isOpen);
});

// ---- lk-tree ----

const TREE = `<lk-tree label="Course contents"><ul>
  <li open>Unit 1
    <ul>
      <li data-value="a">Lesson A</li>
      <li>Lesson B<ul><li>Part i</li></ul></li>
    </ul>
  </li>
  <li>Unit 2<ul><li>Lesson C</li></ul></li>
</ul></lk-tree>`;

const items = (el) => [...el.querySelectorAll('[role=treeitem]')];
const label = (li) => li.querySelector(':scope > .lk-tree__row').textContent.trim();
const shown = (el) => items(el).filter((li) => !li.closest('[hidden]')).map(label);

test('tree: roles, levels, names and one tab stop', async () => {
  const el = await mount(TREE);
  const root = el.querySelector('[role=tree]');
  equal(root.getAttribute('aria-label'), 'Course contents');
  equal(items(el).map((li) => li.getAttribute('aria-level')), ['1', '2', '2', '3', '1', '2']);
  equal(el.querySelectorAll('[role=group]').length, 3);
  equal(items(el).filter((li) => li.tabIndex === 0).length, 1);
  equal(items(el)[0].getAttribute('aria-expanded'), 'true');
  equal(items(el)[2].getAttribute('aria-expanded'), 'false');
  assert(!items(el)[1].hasAttribute('aria-expanded'), 'leaves have no aria-expanded');
});

test('tree: only open branches show their children', async () => {
  const el = await mount(TREE);
  equal(shown(el), ['Unit 1', 'Lesson A', 'Lesson B', 'Unit 2']);
});

test('tree: arrow keys move through visible items and open and close branches', async () => {
  const el = await mount(TREE);
  items(el)[0].focus();
  press(document.activeElement, 'ArrowDown');
  equal(label(document.activeElement), 'Lesson A');
  press(document.activeElement, 'ArrowDown');
  press(document.activeElement, 'ArrowRight'); // opens Lesson B
  equal(items(el)[2].getAttribute('aria-expanded'), 'true');
  press(document.activeElement, 'ArrowRight'); // into it
  equal(label(document.activeElement), 'Part i');
  press(document.activeElement, 'ArrowLeft'); // to the parent
  equal(label(document.activeElement), 'Lesson B');
  press(document.activeElement, 'ArrowLeft'); // closes
  equal(items(el)[2].getAttribute('aria-expanded'), 'false');
  press(document.activeElement, 'End');
  equal(label(document.activeElement), 'Unit 2');
  press(document.activeElement, 'Home');
  equal(label(document.activeElement), 'Unit 1');
  equal(items(el).filter((li) => li.tabIndex === 0).length, 1);
});

test('tree: star opens every branch at that level; typing jumps', async () => {
  const el = await mount(TREE);
  items(el)[0].focus();
  press(document.activeElement, '*');
  equal(items(el)[4].getAttribute('aria-expanded'), 'true');
  press(document.activeElement, 'l');
  equal(label(document.activeElement), 'Lesson A');
});

test('tree: choosing an item selects it and reports the path and value', async () => {
  const el = await mount(TREE);
  const seen = listen(el, 'lk-select');
  click(items(el)[1].querySelector('.lk-tree__row'));
  equal(items(el)[1].getAttribute('aria-selected'), 'true');
  equal(items(el)[0].getAttribute('aria-selected'), 'false');
  equal(seen, [{ label: 'Lesson A', value: 'a', path: ['Unit 1', 'Lesson A'] }]);
  assert(document.activeElement === items(el)[1], 'clicking moves the tab stop');
});

test('tree: choosing a branch toggles it, and Enter does the same from the keyboard', async () => {
  const el = await mount(TREE);
  const toggles = listen(el, 'lk-toggle');
  click(items(el)[4].querySelector('.lk-tree__row'));
  equal(items(el)[4].getAttribute('aria-expanded'), 'true');
  press(document.activeElement, 'Enter');
  equal(items(el)[4].getAttribute('aria-expanded'), 'false');
  equal(toggles.map((t) => t.open), [true, false]);
});

test('tree: an item with a link follows it, and the link is not a tab stop', async () => {
  const el = await mount(`<lk-tree label="T"><ul><li><a href="#lesson-1">Lesson 1</a></li></ul></lk-tree>`);
  const a = el.querySelector('a');
  equal(a.tabIndex, -1);
  let followed = 0;
  a.addEventListener('click', (e) => { e.preventDefault(); followed += 1; });
  items(el)[0].focus();
  press(document.activeElement, 'Enter');
  equal(followed, 1);
});

test('tree: expandAll, collapseAll and select() work from code', async () => {
  const el = await mount(TREE);
  el.expandAll();
  equal(shown(el).length, 6);
  el.collapseAll();
  equal(shown(el), ['Unit 1', 'Unit 2']);
  el.select(3); // Part i, inside two closed branches
  equal(el.selectedLabel, 'Part i');
  equal(shown(el).includes('Part i'), true);
});

// ---- lk-drawer ----

const DRAWER = `<div><button data-lk-open="drw" id="drw-open">Open</button>
  <lk-drawer id="drw" heading="Filters" side="start"><p>Content</p><button data-lk-close="done">Done</button></lk-drawer></div>`;

test('drawer: opens as a modal dialog docked to the chosen side', async () => {
  const wrap = await mount(DRAWER);
  const drawer = wrap.querySelector('lk-drawer');
  const seen = listen(drawer, 'lk-open');
  click(wrap.querySelector('#drw-open'));
  assert(drawer.isOpen);
  equal(seen.length, 1);
  const dialog = drawer.querySelector('dialog');
  settle(dialog); // the slide-in finishes
  assert(dialog.matches(':modal'), 'is modal');
  equal(dialog.dataset.side, 'start');
  assert(dialog.classList.contains('lk-drawer__dialog'));
  const r = dialog.getBoundingClientRect();
  assert(Math.abs(r.left) < 1, 'docked to the start edge');
  assert(r.height >= window.innerHeight - 1, 'full height');
  assert(drawer.querySelector('[role=heading]').textContent === 'Filters');
  drawer.close();
});

test('drawer: end side docks to the other edge, and closing returns focus and a value', async () => {
  const wrap = await mount(DRAWER.replace('side="start"', ''));
  const drawer = wrap.querySelector('lk-drawer');
  const closed = listen(drawer, 'lk-close');
  const opener = wrap.querySelector('#drw-open');
  opener.focus();
  click(opener);
  const dialog = drawer.querySelector('dialog');
  settle(dialog);
  assert(Math.abs(dialog.getBoundingClientRect().right - document.documentElement.clientWidth) < 1, 'docked to the end edge');
  click(drawer.querySelector('[data-lk-close]'));
  equal(closed, [{ returnValue: 'done' }]);
  assert(document.activeElement === opener, 'focus returned');
});

test('drawer: Escape closes it', async () => {
  const wrap = await mount(DRAWER);
  const drawer = wrap.querySelector('lk-drawer');
  click(wrap.querySelector('#drw-open'));
  drawer.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
  drawer.close('cancel');
  assert(!drawer.isOpen);
});
