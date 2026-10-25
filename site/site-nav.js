// <site-nav current="pieces"> is the header on every page of the LearnKit site.
// It is site furniture, not a piece of the library, so it lives here and not in src/.
//
// Write it with a plain link home inside, so a page still has a way back when
// scripts are off. The element replaces that link with the full header.
//
//   <site-nav current="pieces"><p class="back-link"><a href="../">&larr; LearnKit home</a></p></site-nav>
//
// `current` is the id of the page you are on: home, pieces, looks, make or lessons.
//
// The header also holds the Look and Mode menus for the whole page. The choice is
// remembered between pages, and a page that wants to follow it can listen for the
// `lk-sitelook` event on the document ({ look, mode }).
import { LkElement, define } from '../src/core/base.js';
import '../src/lk-menu.js';
import { HOME, SITE_LINKS } from './links.js';
import { LOOKS, MODES, readChoice, saveChoice } from './look.js';

// Links are worked out from where this file is, so the header works from any folder depth.
const ROOT = new URL('../', import.meta.url);
const href = (path) => new URL(path, ROOT).href;

/** True when `url` is the page being viewed, treating "folder/" and "folder/index.html" as the same page. */
function isHere(url) {
  const clean = (path) => path.replace(/index\.html$/, '');
  return clean(url.pathname) === clean(location.pathname);
}

const root = document.documentElement;
const storage = (() => {
  try {
    return localStorage;
  } catch {
    return null;
  }
})();

/** Makes sure a theme's stylesheet is on the page. Pages load only the ones they need to start with. */
function ensureSheet(look) {
  if (!look) return;
  const sheet = new URL(`src/themes/${look}.css`, ROOT).href;
  if ([...document.querySelectorAll('link[rel=stylesheet]')].some((l) => l.href === sheet)) return;
  const el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = sheet;
  document.head.append(el);
}

/** Puts a look and mode on the page, then tells anything that wants to follow. */
function apply({ look, mode }) {
  if (look) root.setAttribute('data-lk-theme', look);
  else root.removeAttribute('data-lk-theme');
  if (mode) root.setAttribute('data-lk-mode', mode);
  else root.removeAttribute('data-lk-mode');
  ensureSheet(look);
  document.dispatchEvent(new CustomEvent('lk-sitelook', { detail: { look, mode } }));
}

// Apply the remembered choice as soon as this file runs, so the page is not drawn in one look and then changed.
// With nothing remembered, the page keeps whatever look it was written with.
apply(readChoice(storage, root.getAttribute('data-lk-theme') ?? ''));

function link(text, path, current) {
  const a = document.createElement('a');
  a.href = href(path);
  a.textContent = text;
  if (current) a.setAttribute('aria-current', 'page');
  return a;
}

export class SiteNav extends LkElement {
  setup() {
    const current = this.getAttribute('current');
    const nav = document.createElement('nav');
    nav.className = 'site-nav';
    nav.setAttribute('aria-label', 'Site');

    const brand = link(HOME.label, HOME.path, current === 'home');
    brand.className = 'site-nav__brand';

    const list = document.createElement('ul');
    list.className = 'site-nav__list';
    for (const item of SITE_LINKS) {
      const li = document.createElement('li');
      if (item.id === current) li.dataset.current = '';
      if (item.menu) {
        const menu = document.createElement('lk-menu');
        menu.setAttribute('label', item.label);
        menu.setAttribute('variant', 'link');
        for (const entry of item.menu) {
          const a = link(entry.label, entry.path, isHere(new URL(href(entry.path))));
          a.setAttribute('data-lk-item', '');
          menu.append(a);
        }
        li.append(menu);
      } else {
        li.append(link(item.label, item.path, item.id === current));
      }
      list.append(li);
    }

    nav.append(brand, list, this.#looks());
    this.replaceChildren(nav);
  }

  /** The Look and Mode menus. */
  #looks() {
    const id = this.makeId();
    const wrap = document.createElement('div');
    wrap.className = 'site-nav__look';
    const menu = (name, options, value, onChange) => {
      const label = document.createElement('label');
      label.textContent = name;
      label.htmlFor = `${id}-${name.toLowerCase()}`;
      const select = document.createElement('select');
      select.id = label.htmlFor;
      select.className = 'lk-control site-nav__select';
      for (const option of options) select.append(new Option(option.name, option.id));
      select.value = value;
      select.addEventListener('change', () => onChange(select.value));
      const group = document.createElement('div');
      group.append(label, select);
      return group;
    };
    const choice = { look: root.getAttribute('data-lk-theme') ?? '', mode: root.getAttribute('data-lk-mode') ?? '' };
    const change = (next) => {
      Object.assign(choice, next);
      apply(choice);
      saveChoice(storage, choice);
    };
    wrap.append(
      menu('Look', LOOKS, choice.look, (look) => change({ look })),
      menu('Mode', MODES, choice.mode, (mode) => change({ mode }))
    );
    return wrap;
  }
}

define('site-nav', SiteNav);
