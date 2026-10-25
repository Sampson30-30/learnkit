// Fills in the live parts of the home page: a sample to try, the library
// (every piece, working, grouped by what it is for) and the looks.

import '../src/index.js';
import { DEMOS, THEMES } from '../gallery/demos.js';
import { SHELVES, HERO_SAMPLE, ALL_PIECES } from './catalogue.js';

const el = (tag, className, html) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
};
const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let uid = 0;

// ---- A sample to try straight away ----

function sample() {
  const host = document.getElementById('sample');
  if (!host) return;
  const cards = el('lk-flashcards');
  cards.setAttribute('label', HERO_SAMPLE.label);
  for (const [front, back] of HERO_SAMPLE.cards) {
    const card = el('div', '', `<p>${escape(back)}</p>`);
    card.setAttribute('data-lk-card', front);
    cards.append(card);
  }
  host.append(cards);
}

// ---- The library ----

function piece(p) {
  const demo = DEMOS.find((d) => d.id === p.id);
  const li = el('li', `piece${p.wide ? ' piece--wide' : ''}`);
  li.innerHTML = `
    <h3 class="piece__name">${escape(p.name)} <span class="piece__tag">Ask Claude for <code>${escape(p.tags)}</code></span></h3>
    <p class="piece__what">${escape(p.what)}</p>`;
  const holder = el('div', 'piece__demo');
  if (demo) holder.innerHTML = demo.html(`home${(uid += 1)}`);
  li.append(holder);
  const more = el('p', 'piece__more', `<a href="gallery/#view=compare&component=${encodeURIComponent(p.id)}">See it in every look<span class="lk-visually-hidden"> (${escape(p.name)})</span></a>`);
  li.append(more);
  return li;
}

function library() {
  const host = document.getElementById('shelves');
  if (!host) return;
  document.getElementById('library-count').textContent = `${ALL_PIECES.length} pieces on ${SHELVES.length} shelves. Every one is working: try it.`;
  const tabs = el('lk-tabs');
  tabs.setAttribute('label', 'The library, by what each piece is for');
  for (const shelf of SHELVES) {
    const panel = el('div', 'shelf', `<p class="shelf-blurb">${escape(shelf.blurb)}</p>`);
    panel.setAttribute('data-lk-tab', shelf.title);
    const list = el('ul', 'pieces');
    for (const p of shelf.pieces) list.append(piece(p));
    panel.append(list);
    tabs.append(panel);
  }
  host.replaceChildren(tabs);
}

// ---- Looks ----

const root = document.documentElement;

function looks() {
  const host = document.getElementById('looks');
  if (!host) return;
  for (const theme of THEMES.filter((t) => t.id)) {
    const li = el('li');
    const box = el('div', 'look');
    box.setAttribute('data-lk-theme', theme.id);
    if (root.dataset.lkMode) box.setAttribute('data-lk-mode', root.dataset.lkMode);
    box.innerHTML = `
      <h3>${escape(theme.name)}</h3>
      <p>${escape(theme.note)}</p>
      <div class="look__sample">
        <div class="row"><button type="button" class="lk-button" data-variant="primary">Start</button><button type="button" class="lk-button">Back</button><span class="lk-badge" data-tone="success">Done</span></div>
        <lk-progress label="${escape(theme.name)} look: course progress" value="60" show-value></lk-progress>
        <lk-alert tone="info">A tip sits here.</lk-alert>
      </div>`;
    li.append(box);
    host.append(li);
  }
}

sample();
library();
looks();

// The looks on show follow the page's Light or Dark choice, so the page never half-changes.
document.addEventListener('lk-sitelook', (e) => {
  for (const box of document.querySelectorAll('.look')) {
    if (e.detail.mode) box.setAttribute('data-lk-mode', e.detail.mode);
    else box.removeAttribute('data-lk-mode');
  }
});
