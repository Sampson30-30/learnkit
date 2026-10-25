import { LkElement, define } from './core/base.js';
import { shuffle } from './core/flashcards.js';
import { pointerDrag } from './core/drag.js';
import { togglePickup, sortTargets, pickedMessage, putDownMessage, pickButton, placeButton } from './core/pickup.js';
import { UNSORTED, placeItem, checkSort, sortMessage, markWord, placeMessage } from './core/sort.js';

/**
 * <lk-sort> asks the learner to sort items into groups. Write each item under
 * the group where it BELONGS; the items are shuffled into a pile for the learner.
 *
 *   <lk-sort label="Sort these into the right group">
 *     <ul data-lk-group="Formative">
 *       <li>A quiz in class</li><li>Feedback on a draft</li>
 *     </ul>
 *     <ul data-lk-group="Summative">
 *       <li>A final exam</li>
 *     </ul>
 *   </lk-sort>
 *
 * Every item has a "Move to" list, so it works with a keyboard, a screen
 * reader or a touch screen. Mouse, finger and pen users can also drag an item
 * by its handle onto a group. "Check answers" marks every item in words as
 * well as colour, and moving an item clears its mark.
 *
 * Add `pickup` for a way to move an item without dragging or opening a list:
 * press Pick up on an item, then Place in (group) under the group it belongs
 * in. Escape, or pressing Pick up again, puts it down.
 *
 * Attributes:
 *   label   Instruction for the activity. Required.
 *   pickup  Adds Pick up and Place buttons.
 *
 * Events: lk-sortchange { item, group }, lk-check { score, total, complete }.
 * Methods: place(item, group) with -1 for the pile, check(), reset().
 */
export class LkSort extends LkElement {
  setup() {
    const sources = [...this.querySelectorAll(':scope > [data-lk-group]')];
    this.groups = sources.map((g) => g.getAttribute('data-lk-group').trim()).filter(Boolean);
    this.items = [];
    sources.forEach((source, group) => {
      for (const li of source.children) {
        if (li.localName !== 'li') continue;
        this.items.push({ html: li.innerHTML, text: li.textContent.trim(), answer: group });
      }
    });
    if (this.groups.length < 2 || this.items.length < 2) return;

    const id = this.makeId();
    this.heading = document.createElement('p');
    this.heading.className = 'lk-sort__label';
    this.heading.id = `${id}-label`;
    this.heading.textContent = this.getAttribute('label') || 'Sort these into groups';

    this.pile = document.createElement('div');
    this.pile.className = 'lk-sort__zone lk-sort__pile';
    this.pile.dataset.group = String(UNSORTED);
    this.board = document.createElement('div');
    this.board.className = 'lk-sort__board';
    this.zones = this.groups.map((name, group) => {
      const zone = document.createElement('section');
      zone.className = 'lk-sort__zone';
      zone.dataset.group = String(group);
      return zone;
    });

    this.feedback = document.createElement('p');
    this.feedback.className = 'lk-sort__feedback';
    this.feedback.setAttribute('role', 'status');
    this.live = document.createElement('p');
    this.live.className = 'lk-visually-hidden';
    this.live.setAttribute('role', 'status');

    const actions = document.createElement('div');
    actions.className = 'lk-sort__actions';
    this.checkButton = this.#button('Check answers', 'primary', () => this.check());
    this.resetButton = this.#button('Start again', '', () => this.reset());
    actions.append(this.checkButton, this.resetButton);

    this.picked = null;
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.picked !== null) {
        e.preventDefault();
        this.#putDown();
      }
    });

    this.board.append(...this.zones);
    this.setAttribute('role', 'group');
    this.setAttribute('aria-labelledby', this.heading.id);
    this.replaceChildren(this.heading, this.pile, this.board, actions, this.feedback, this.live);
    this.reset();
  }

  /** Where each item is now: the group name, or null while it is in the pile. */
  get placed() {
    return this.placements.map((g) => (g === UNSORTED ? null : this.groups[g]));
  }

  /** Shuffle everything back into the pile and clear any marking. */
  reset() {
    this.placements = this.items.map(() => UNSORTED);
    this.pileOrder = shuffle(this.items.map((_, i) => i));
    this.marks = null;
    this.picked = null;
    this.feedback.textContent = '';
    delete this.feedback.dataset.outcome;
    this.#render();
  }

  /** Move an item to a group, or back to the pile with -1, as the learner would. */
  place(item, group, restoreFocus = false) {
    const next = placeItem(this.placements, item, group);
    if (next === this.placements) return;
    this.placements = next;
    this.marks = null;
    this.picked = null;
    this.feedback.textContent = '';
    delete this.feedback.dataset.outcome;
    this.#render();
    const name = next[item] === UNSORTED ? null : this.groups[next[item]];
    this.live.textContent = placeMessage(this.items[item].text, name);
    if (restoreFocus) this.querySelector(`[data-item="${item}"] select`)?.focus();
    this.emit('sortchange', { item, group: name });
  }

  /** Mark every item now, as if the learner had pressed "Check answers". */
  check() {
    const result = checkSort(this.placements, this.items.map((i) => i.answer));
    this.marks = result.marks;
    this.picked = null;
    this.feedback.textContent = sortMessage(result);
    this.feedback.dataset.outcome = result.complete ? 'good' : 'mixed';
    this.#render();
    this.emit('check', { score: result.score, total: result.total, complete: result.complete });
  }

  /** Picks an item up, or puts it down if it is already held. */
  #pick(item) {
    this.picked = togglePickup(this.picked, item);
    this.#render();
    const label = this.items[item].text;
    this.live.textContent = this.picked === null ? putDownMessage(label) : pickedMessage(label, 'a group');
    this.#focusPick(item);
  }

  #putDown() {
    const item = this.picked;
    this.picked = null;
    this.#render();
    this.live.textContent = putDownMessage(this.items[item].text);
    this.#focusPick(item);
  }

  #focusPick(item) {
    this.querySelector(`[data-item="${item}"] .lk-pickup__pick`)?.focus();
  }

  #render() {
    const inPile = this.pileOrder.filter((i) => this.placements[i] === UNSORTED);
    this.#fill(this.pile, 'Items to sort', inPile, 'Nothing left to sort.');
    this.zones.forEach((zone, group) => {
      const inGroup = this.items.map((_, i) => i).filter((i) => this.placements[i] === group);
      this.#fill(zone, this.groups[group], inGroup, 'Drop items here.');
    });
  }

  #fill(zone, title, indexes, emptyText) {
    const heading = document.createElement('p');
    heading.className = 'lk-sort__title';
    heading.textContent = title;
    const list = document.createElement('ul');
    list.className = 'lk-sort__list';
    list.setAttribute('aria-label', title);
    if (indexes.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'lk-sort__empty';
      empty.textContent = emptyText;
      list.append(empty);
    }
    for (const i of indexes) list.append(this.#item(i));
    zone.replaceChildren(heading, list);
    const group = Number(zone.dataset.group);
    if (this.picked !== null && sortTargets(this.placements[this.picked], this.groups.length).includes(group)) {
      const item = this.picked;
      zone.dataset.target = '';
      zone.append(placeButton(group === UNSORTED ? 'Place back in the pile' : `Place in ${title}`, () => {
        this.place(item, group, false);
        this.#focusPick(item);
      }));
    } else {
      delete zone.dataset.target;
    }
  }

  #item(i) {
    const item = this.items[i];
    const li = document.createElement('li');
    li.className = 'lk-sort__item';
    li.dataset.item = String(i);
    const mark = this.marks?.[i];
    if (mark && mark !== 'unsorted') li.dataset.state = mark;

    const handle = document.createElement('span');
    handle.className = 'lk-sort__handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.textContent = '⠇';
    pointerDrag(handle, li, {
      onOver: (target) => this.#highlight(target),
      onDrop: (target) => {
        const zone = target?.closest?.('.lk-sort__zone');
        if (zone && this.contains(zone)) this.place(i, Number(zone.dataset.group), true);
      },
    });

    const text = document.createElement('span');
    text.className = 'lk-sort__text';
    text.innerHTML = item.html;

    const select = document.createElement('select');
    select.className = 'lk-control lk-sort__move';
    select.setAttribute('aria-label', `Move ${item.text} to`);
    select.append(new Option('The pile', String(UNSORTED)));
    this.groups.forEach((name, group) => select.append(new Option(name, String(group))));
    select.value = String(this.placements[i]);
    select.addEventListener('change', () => this.place(i, Number(select.value), true));

    li.append(handle, text, select);
    if (this.hasAttribute('pickup')) li.append(pickButton(item.text, this.picked === i, () => this.#pick(i)));
    if (this.picked === i) li.dataset.picked = '';
    if (mark) {
      const word = document.createElement('span');
      word.className = 'lk-sort__mark';
      word.textContent = markWord(mark);
      li.append(word);
    }
    return li;
  }

  /** Shows which group an item being dragged would land in. */
  #highlight(target) {
    const over = target?.closest?.('.lk-sort__zone');
    for (const zone of [this.pile, ...this.zones]) {
      if (zone === over) zone.dataset.over = '';
      else delete zone.dataset.over;
    }
  }

  #button(text, variant, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lk-button';
    if (variant) b.dataset.variant = variant;
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }
}

define('lk-sort', LkSort);
