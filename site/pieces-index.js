// The index beside the Examples page: every piece in one short list, grouped
// the way the home page groups them, with a search box and a marker on the piece
// you are reading. Put an element with id="pieces-index" before the sections and
// give each `section.ex` a data-shelf. Then call mountPiecesIndex().
import { SHELVES, ALL_PIECES } from '../home/catalogue.js';
import { groupSections, filterGroups, countItems, filterMessage, activeSection } from './pieces.js';

/** Reads the example sections from the page. */
function readSections(root) {
  return [...root.querySelectorAll('section.ex')].map((section) => ({
    id: section.id,
    heading: section.querySelector('h2')?.textContent.trim() ?? section.id,
    shelf: section.dataset.shelf,
  }));
}

/** Builds the index. Returns the element and a function that marks one piece as the one being read. */
export function buildPiecesIndex(sections, shelves = SHELVES, pieces = ALL_PIECES) {
  const groups = groupSections(sections, shelves, pieces);
  const total = countItems(groups);

  const box = document.createElement('details');
  box.className = 'pieces-index';
  const summary = document.createElement('summary');
  summary.textContent = `Jump to a piece (${total})`;

  const body = document.createElement('div');
  body.className = 'pieces-index__body';
  const label = document.createElement('label');
  label.className = 'pieces-index__label';
  label.textContent = 'Find a piece';
  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'lk-control pieces-index__search';
  input.setAttribute('autocomplete', 'off');
  label.append(input);
  let active = null;
  const status = document.createElement('p');
  status.className = 'pieces-index__status';
  status.setAttribute('role', 'status');
  status.textContent = filterMessage(total, total, '');
  const results = document.createElement('div');
  body.append(label, status, results);
  box.append(summary, body);

  function render() {
    const shown = filterGroups(groups, input.value);
    const count = countItems(shown);
    status.textContent = filterMessage(count, total, input.value);
    results.replaceChildren(
      ...shown.map((group) => {
        const wrap = document.createElement('div');
        const title = document.createElement('p');
        title.className = 'pieces-index__shelf';
        title.textContent = group.title;
        const list = document.createElement('ul');
        list.className = 'pieces-index__list';
        for (const item of group.items) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#${item.id}`;
          a.textContent = item.label;
          a.dataset.piece = item.id;
          li.append(a);
          list.append(li);
        }
        wrap.append(title, list);
        return wrap;
      })
    );
    if (active) mark(active);
  }

  /** Marks the piece being read. */
  function mark(id) {
    active = id;
    for (const a of results.querySelectorAll('a')) {
      if (a.dataset.piece === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  }

  input.addEventListener('input', render);
  // Enter jumps to the first match, so a search can be finished from the keyboard.
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      results.querySelector('a')?.click();
    }
  });
  render();
  return { element: box, mark, input };
}

/** Builds the index into the page and keeps it in step with scrolling. */
export function mountPiecesIndex(root = document) {
  const holder = root.getElementById('pieces-index');
  if (!holder) return;
  const sections = readSections(root);
  const { element, mark } = buildPiecesIndex(sections);
  holder.replaceChildren(element);

  // Open on a wide screen, where the list is always on show, and folded away on a narrow one.
  const wide = matchMedia('(min-width: 60rem)');
  const fit = () => (element.open = wide.matches);
  fit();
  wide.addEventListener('change', fit);

  // Mark the piece being read: the last one whose top has passed a third of the way down the screen.
  const elements = sections.map((section) => root.getElementById(section.id));
  const update = () => {
    const tops = elements.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top }));
    mark(activeSection(tops, innerHeight / 3));
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
