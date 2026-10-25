// <site-nav current="pieces"> is the header on every page of the LearnKit site.
// It is site furniture, not a piece of the library, so it lives here and not in src/.
//
// Write it with a plain link home inside, so a page still has a way back when
// scripts are off. The element replaces that link with the full header.
//
//   <site-nav current="pieces"><p class="back-link"><a href="../">&larr; LearnKit home</a></p></site-nav>
//
// `current` is the id of the page you are on: home, pieces, looks, make or lessons.
import { LkElement, define } from '../src/core/base.js';
import '../src/lk-menu.js';
import { HOME, SITE_LINKS } from './links.js';

// Links are worked out from where this file is, so the header works from any folder depth.
const ROOT = new URL('../', import.meta.url);
const href = (path) => new URL(path, ROOT).href;

/** True when `url` is the page being viewed, treating "folder/" and "folder/index.html" as the same page. */
function isHere(url) {
  const clean = (path) => path.replace(/index\.html$/, '');
  return clean(url.pathname) === clean(location.pathname);
}

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

    nav.append(brand, list);
    this.replaceChildren(nav);
  }
}

define('site-nav', SiteNav);
