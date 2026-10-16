import { LkElement, define } from './core/base.js';
import { expectsTick, checkMatrix, matrixMessage, markWord, answerText } from './core/matrix.js';

/**
 * <lk-matrix> turns a native table into an activity. Cells the learner must
 * complete are marked in the markup; every other cell stays as written. The
 * table reads normally without JavaScript.
 *
 *   <lk-matrix label="Match each theory to its idea">
 *     <table>
 *       <caption>Learning theories</caption>
 *       <thead><tr><th></th><th>Focus</th><th>Active learner</th></tr></thead>
 *       <tbody>
 *         <tr><th>Behaviourism</th><td data-answer="Behaviour|Habits">Behaviour</td><td data-tick="no"></td></tr>
 *         <tr><th>Constructivism</th><td data-answer="Meaning">Meaning</td><td data-tick="yes"></td></tr>
 *       </tbody>
 *     </table>
 *   </lk-matrix>
 *
 * Cells:
 *   data-answer="x|y"  A text box. Any of the answers separated by | is accepted,
 *                      ignoring capitals and spare spaces.
 *   data-tick="yes"    A tick box that should be ticked.
 *   data-tick="no"     A tick box that should be left empty.
 *
 * Attributes:
 *   label         Instruction for the activity. Required.
 *   show-answers  Adds a "Show answers" button after the learner has checked.
 *
 * Every box is named by its row and column headings, and every mark is written
 * in words as well as shown in colour. Changing a box clears its mark.
 *
 * Events: lk-check { score, total, complete }, lk-reveal {}.
 * Methods: check(), reset(), reveal().
 */
export class LkMatrix extends LkElement {
  setup() {
    this.table = this.querySelector('table');
    if (!this.table) return;
    const cells = [...this.table.querySelectorAll('td[data-answer], td[data-tick]')];
    if (cells.length === 0) return;
    const id = this.makeId();

    this.slots = cells.map((cell, i) => {
      const isTick = cell.hasAttribute('data-tick');
      const slot = isTick
        ? { kind: 'tick', answer: expectsTick(cell.dataset.tick) }
        : { kind: 'text', answer: cell.dataset.answer };
      slot.cell = cell;
      slot.name = this.#nameFor(cell);
      slot.control = this.#buildControl(slot, `${id}-${i}`);
      return slot;
    });

    this.heading = document.createElement('p');
    this.heading.className = 'lk-matrix__label';
    this.heading.id = `${id}-label`;
    this.heading.textContent = this.getAttribute('label') || 'Complete the table';

    this.wrap = document.createElement('div');
    this.wrap.className = 'lk-matrix__wrap';
    this.wrap.tabIndex = 0;
    this.wrap.setAttribute('role', 'region');
    this.wrap.setAttribute('aria-labelledby', this.heading.id);
    this.table.before(this.wrap);
    this.wrap.append(this.table);

    this.feedback = document.createElement('p');
    this.feedback.className = 'lk-matrix__feedback';
    this.feedback.setAttribute('role', 'status');

    const actions = document.createElement('div');
    actions.className = 'lk-matrix__actions';
    this.checkButton = this.#button('Check answers', 'primary', () => this.check());
    this.resetButton = this.#button('Start again', '', () => this.reset());
    actions.append(this.checkButton, this.resetButton);
    if (this.hasAttribute('show-answers')) {
      this.revealButton = this.#button('Show answers', '', () => this.reveal());
      this.revealButton.hidden = true;
      actions.append(this.revealButton);
    }

    this.wrap.before(this.heading);
    this.wrap.after(actions, this.feedback);
    this.reset();
  }

  /** What the learner has entered, in reading order: text for text cells, true or false for ticks. */
  get values() {
    return this.slots.map((s) => (s.kind === 'tick' ? s.control.checked : s.control.value));
  }

  /** Mark every box now, as if the learner had pressed "Check answers". */
  check() {
    const result = checkMatrix(this.slots, this.values);
    this.slots.forEach((slot, i) => this.#mark(slot, result.marks[i]));
    this.feedback.textContent = matrixMessage(result);
    this.feedback.dataset.outcome = result.complete ? 'good' : 'mixed';
    this.checked = true;
    if (this.revealButton) this.revealButton.hidden = result.complete;
    this.emit('check', { score: result.score, total: result.total, complete: result.complete });
  }

  /** Clear every box and every mark. */
  reset() {
    for (const slot of this.slots) {
      if (slot.kind === 'tick') slot.control.checked = false;
      else slot.control.value = '';
      slot.control.disabled = false;
      this.#mark(slot, null);
    }
    this.feedback.textContent = '';
    delete this.feedback.dataset.outcome;
    this.checked = false;
    if (this.revealButton) this.revealButton.hidden = true;
  }

  /** Fill in the right answers and lock the boxes. */
  reveal() {
    for (const slot of this.slots) {
      if (slot.kind === 'tick') slot.control.checked = slot.answer;
      else slot.control.value = answerText(slot);
      slot.control.disabled = true;
      this.#mark(slot, 'shown');
    }
    this.feedback.textContent = 'The right answers are shown. Choose Start again to try it yourself.';
    this.feedback.dataset.outcome = 'mixed';
    if (this.revealButton) this.revealButton.hidden = true;
    this.emit('reveal', {});
  }

  /** "Row heading, column heading" for a cell, so a screen reader hears where the box is. */
  #nameFor(cell) {
    const row = cell.parentElement;
    const rowHead = row.querySelector('th')?.textContent.trim() || row.cells[0]?.textContent.trim() || '';
    const header = this.table.tHead?.rows[this.table.tHead.rows.length - 1]?.cells[cell.cellIndex];
    const colHead = header?.textContent.trim() || '';
    return [rowHead, colHead].filter(Boolean).join(', ') || 'Answer';
  }

  #buildControl(slot, id) {
    const control = document.createElement('input');
    control.id = id;
    if (slot.kind === 'tick') {
      control.type = 'checkbox';
      control.className = 'lk-matrix__tick';
    } else {
      control.type = 'text';
      control.className = 'lk-control lk-matrix__text';
      control.autocomplete = 'off';
      control.spellcheck = false;
    }
    control.setAttribute('aria-label', slot.name);
    control.addEventListener('input', () => {
      if (slot.control.dataset.mark) this.#mark(slot, null);
    });
    control.addEventListener('change', () => {
      if (slot.control.dataset.mark) this.#mark(slot, null);
    });

    const word = document.createElement('span');
    word.className = 'lk-matrix__mark';
    slot.word = word;
    slot.cell.replaceChildren(control, word);
    return control;
  }

  #mark(slot, mark) {
    if (mark) {
      slot.control.dataset.mark = mark;
      slot.cell.dataset.state = mark;
      slot.word.textContent = mark === 'shown' ? 'Answer' : markWord(mark);
      slot.control.setAttribute('aria-invalid', mark === 'wrong' || mark === 'blank' ? 'true' : 'false');
    } else {
      delete slot.control.dataset.mark;
      delete slot.cell.dataset.state;
      slot.word.textContent = '';
      slot.control.removeAttribute('aria-invalid');
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

define('lk-matrix', LkMatrix);
