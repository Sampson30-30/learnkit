import { LkElement, define } from './core/base.js';
import { clamp } from './core/utils.js';
import { groupByLetter, matchEntry, glossarySummary } from './core/glossary.js';

/**
 * <lk-glossary> shows a list of terms and their meanings, sorted A to Z, with
 * a search box and jump links for each letter. Write the terms in any order.
 *
 *   <lk-glossary label="Key terms">
 *     <dl>
 *       <dt>Formative assessment</dt>
 *       <dd>Checking progress during learning, to help it along.</dd>
 *       <dt>Summative assessment</dt>
 *       <dd>Judging what has been learned at the end.</dd>
 *     </dl>
 *   </lk-glossary>
 *
 * Attributes:
 *   label  Name for the glossary. Required.
 *   level  Heading level for the letter headings, 1 to 6 (default 3).
 *
 * A term may have more than one meaning: follow its <dt> with several <dd>.
 * The search looks at both terms and meanings. Letters with no terms, or no
 * matching terms, are hidden. Choosing a letter moves focus to its heading.
 * The list reads normally without JavaScript.
 *
 * Event: lk-filter { query, shown, total }.
 */
export class LkGlossary extends LkElement {
  setup() {
    const source = this.querySelector('dl');
    if (!source) return;
    this.entries = [];
    for (const child of source.children) {
      if (child.localName === 'dt') {
        this.entries.push({ term: child.textContent.trim(), termHtml: child.innerHTML, definitions: [], html: [] });
      } else if (child.localName === 'dd' && this.entries.length > 0) {
        const last = this.entries[this.entries.length - 1];
        last.definitions.push(child.textContent.trim());
        last.html.push(child.innerHTML);
      }
    }
    this.entries = this.entries.filter((e) => e.term && e.definitions.length > 0);
    if (this.entries.length === 0) return;

    const id = this.makeId();
    const level = Math.round(clamp(this.getAttribute('level') ?? 3, 1, 6));
    const label = this.getAttribute('label') || 'Glossary';

    // Search box
    const tools = document.createElement('div');
    tools.className = 'lk-glossary__tools';
    const field = document.createElement('label');
    field.className = 'lk-field__label';
    field.htmlFor = `${id}-search`;
    field.textContent = 'Find a term';
    this.input = document.createElement('input');
    this.input.type = 'search';
    this.input.id = `${id}-search`;
    this.input.className = 'lk-control';
    this.input.autocomplete = 'off';
    this.input.addEventListener('input', () => this.#apply());
    tools.append(field, this.input);

    // Letters and the list
    this.groups = groupByLetter(this.entries);
    this.nav = document.createElement('nav');
    this.nav.className = 'lk-glossary__letters';
    this.nav.setAttribute('aria-label', `${label}: jump to a letter`);
    this.list = document.createElement('div');
    this.list.className = 'lk-glossary__list';

    for (const group of this.groups) {
      const headingId = `${id}-${group.letter === '#' ? 'other' : group.letter}`;
      const link = document.createElement('a');
      link.href = `#${headingId}`;
      link.className = 'lk-glossary__letter';
      link.textContent = group.letter;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        group.section.querySelector('.lk-glossary__heading').focus();
        group.section.scrollIntoView({ block: 'start' });
      });
      group.link = link;
      this.nav.append(link);

      const section = document.createElement('section');
      section.className = 'lk-glossary__group';
      const heading = document.createElement(`h${level}`);
      heading.id = headingId;
      heading.className = 'lk-glossary__heading';
      heading.tabIndex = -1;
      heading.textContent = group.letter;
      const dl = document.createElement('dl');
      dl.className = 'lk-glossary__terms';
      for (const entry of group.entries) {
        const wrapper = document.createElement('div');
        wrapper.className = 'lk-glossary__entry';
        const dt = document.createElement('dt');
        dt.innerHTML = entry.termHtml;
        wrapper.append(dt);
        for (const html of entry.html) {
          const dd = document.createElement('dd');
          dd.innerHTML = html;
          wrapper.append(dd);
        }
        entry.element = wrapper;
        dl.append(wrapper);
      }
      section.append(heading, dl);
      group.section = section;
      this.list.append(section);
    }

    this.status = document.createElement('p');
    this.status.className = 'lk-glossary__status';
    this.status.setAttribute('role', 'status');

    this.setAttribute('role', 'region');
    this.setAttribute('aria-label', label);
    this.replaceChildren(tools, this.nav, this.list, this.status);
    this.#apply(false);
  }

  /** Filter to a search now, as if the learner had typed it. */
  filter(query) {
    this.input.value = query;
    this.#apply();
  }

  #apply(announce = true) {
    const query = this.input.value;
    let shown = 0;
    for (const group of this.groups) {
      let inGroup = 0;
      for (const entry of group.entries) {
        const match = matchEntry(entry, query);
        entry.element.hidden = !match;
        if (match) inGroup += 1;
      }
      group.section.hidden = inGroup === 0;
      group.link.hidden = inGroup === 0;
      shown += inGroup;
    }
    this.nav.hidden = shown === 0;
    this.status.textContent = glossarySummary(shown, this.entries.length);
    if (announce) this.emit('filter', { query, shown, total: this.entries.length });
  }
}

define('lk-glossary', LkGlossary);
