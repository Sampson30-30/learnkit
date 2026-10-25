import { LkElement, define } from './core/base.js';
import { clamp } from './core/utils.js';
import { placeMessages, usableMessages, summariseMoves, nextCount, stepStatus, saysLabel, movesSentence } from './core/conversation.js';

/**
 * <lk-conversation> shows a conversation going back and forth, with the
 * questions in it named. It is made for teaching good questioning, such as
 * checking a claim from an AI chatbot. A learner can read it all at once or
 * step through one message at a time, and can open a note on any message.
 *
 *   <lk-conversation label="Checking a chatbot's claim" example stepped>
 *     <div data-lk-from="Chatbot">Research shows learners retain 90% more.</div>
 *     <div data-lk-from="You" data-move="Ask for evidence">Which study says that?
 *       <p data-lk-why>"Research shows" names no source. Ask where it comes from.</p>
 *     </div>
 *   </lk-conversation>
 *
 * Each message is a child with data-lk-from (who is speaking). The first
 * speaker sits at the start and everyone else at the end, unless a message has
 * data-side="start" or data-side="end". Put data-move on a message to name what
 * the question is doing, such as "Clarify" or "Check the source". A child
 * marked data-lk-why becomes a "Why this works" note under the message; give it
 * data-label to use other words, such as "What went wrong".
 *
 * To compare ways of questioning, wrap messages in threads. Each thread has its
 * own title, and they sit side by side when there is room:
 *
 *   <lk-conversation label="Two ways to reply">
 *     <div data-lk-thread="Accepting the claim"> ...messages... </div>
 *     <div data-lk-thread="Questioning the claim"> ...messages... </div>
 *   </lk-conversation>
 *
 * Everything in it is scripted. Add `example` to say so, so nobody mistakes it
 * for a live reply from an AI. A message without a speaker or without words is
 * skipped, and the console says so.
 *
 * Attributes:
 *   label          Accessible name for the whole conversation. Required.
 *   stepped        Show one message at a time, with a "Show next message" button.
 *   example        Say that the conversation is made up. Give it words to replace the default.
 *   why-label      Words on the note button (default "Why this works").
 *   level          Heading level for thread titles, 1 to 6 (default 3).
 *
 * Events:
 *   lk-reveal  detail: { thread, index, remaining }
 *
 * Methods: revealNext(thread = 0), revealAll(), reset(). `el.shown` lists how many messages each thread shows.
 */
export class LkConversation extends LkElement {
  setup() {
    this.threads = this.#read();
    if (!this.threads.length) return;

    this.stepped = this.hasAttribute('stepped');
    this.whyLabel = this.getAttribute('why-label') || 'Why this works';
    this.level = clamp(parseInt(this.getAttribute('level'), 10) || 3, 1, 6);

    const id = this.makeId();
    const parts = [];
    if (this.hasAttribute('example')) {
      const note = document.createElement('p');
      note.className = 'lk-conversation__example';
      note.textContent = this.getAttribute('example') || 'This conversation is made up as an example. It is not a live reply from an AI.';
      parts.push(note);
    }

    const board = document.createElement('div');
    board.className = 'lk-conversation__threads';
    this.views = this.threads.map((t, i) => this.#build(t, i, `${id}-${i}`));
    board.append(...this.views.map((v) => v.root));
    parts.push(board);
    if (this.threads.length > 1) this.dataset.threads = String(this.threads.length);

    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', this.getAttribute('label') || 'Conversation');
    this.replaceChildren(...parts);
    this.views.forEach((_, i) => this.#sync(i));
  }

  /** How many messages each thread is showing. */
  get shown() {
    return this.views.map((v) => v.shown);
  }

  /** Show the next message in a thread, as the learner would. */
  revealNext(thread = 0) {
    const view = this.views?.[thread];
    if (!view || view.shown >= view.total) return;
    view.shown = nextCount(view.shown, view.total);
    this.#sync(thread);
    const item = view.items[view.shown - 1];
    item.focus();
    this.emit('reveal', { thread, index: view.shown - 1, remaining: view.total - view.shown });
  }

  /** Show every message in every thread. */
  revealAll() {
    this.views?.forEach((view, i) => {
      view.shown = view.total;
      this.#sync(i);
    });
  }

  /** Go back to the first message of every thread. */
  reset() {
    if (!this.views) return;
    this.views.forEach((view, i) => {
      view.shown = this.stepped ? Math.min(1, view.total) : view.total;
      view.items.forEach((li) => li.querySelectorAll('details').forEach((d) => (d.open = false)));
      this.#sync(i);
    });
    this.views[0].items[0].focus();
  }

  /** Reads threads and messages from the markup. A conversation with no threads is one thread. */
  #read() {
    const where = '<lk-conversation>';
    const sources = [...this.querySelectorAll(':scope > [data-lk-thread]')];
    const groups = sources.length
      ? sources.map((s) => ({ title: s.getAttribute('data-lk-thread').trim(), nodes: [...s.querySelectorAll(':scope > [data-lk-from]')] }))
      : [{ title: '', nodes: [...this.querySelectorAll(':scope > [data-lk-from]')] }];

    return groups
      .map((group, g) => {
        const raw = group.nodes.map((node) => {
          const why = node.querySelector(':scope > [data-lk-why]');
          const body = node.cloneNode(true);
          body.querySelector(':scope > [data-lk-why]')?.remove();
          return {
            from: node.getAttribute('data-lk-from').trim(),
            side: node.getAttribute('data-side'),
            move: node.getAttribute('data-move')?.trim() || '',
            html: body.innerHTML.trim(),
            text: body.textContent.trim(),
            why: why ? why.innerHTML.trim() : '',
            whyLabel: why?.getAttribute('data-label')?.trim() || '',
          };
        });
        const messages = placeMessages(usableMessages(raw));
        if (messages.length < raw.length) console.warn(`${where} skipped ${raw.length - messages.length} message(s) with no speaker or no words${group.title ? ` in "${group.title}"` : ''}.`);
        if (!messages.length) console.warn(`${where} thread ${g + 1} has no messages, so it was left out.`);
        return { title: group.title, messages };
      })
      .filter((t) => t.messages.length);
  }

  #build(thread, index, id) {
    const root = document.createElement('section');
    root.className = 'lk-conversation__thread';

    if (thread.title) {
      const title = document.createElement(`h${this.level}`);
      title.className = 'lk-conversation__title';
      title.id = `${id}-title`;
      title.textContent = thread.title;
      root.setAttribute('aria-labelledby', title.id);
      root.append(title);
    } else {
      root.setAttribute('aria-label', this.getAttribute('label') || 'Conversation');
    }

    const list = document.createElement('ol');
    list.className = 'lk-conversation__list';
    list.setAttribute('role', 'list');

    const items = thread.messages.map((m, i) => {
      const li = document.createElement('li');
      li.className = 'lk-conversation__message';
      li.dataset.side = m.side;
      li.tabIndex = -1;

      const who = document.createElement('p');
      who.className = 'lk-conversation__who';
      who.setAttribute('aria-hidden', 'true');
      const name = document.createElement('strong');
      name.textContent = m.from;
      const hidden = document.createElement('span');
      hidden.className = 'lk-visually-hidden';
      hidden.textContent = saysLabel(m.from, m.move);
      who.append(name);

      const bubble = document.createElement('div');
      bubble.className = 'lk-conversation__bubble';
      bubble.innerHTML = m.html;

      li.append(hidden, who, bubble);

      if (m.move) {
        const move = document.createElement('p');
        move.className = 'lk-conversation__move';
        move.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        label.className = 'lk-conversation__move-label';
        label.textContent = 'Move: ';
        move.append(label, m.move);
        li.append(move);
      }

      if (m.why) {
        const details = document.createElement('details');
        details.className = 'lk-conversation__why';
        const summary = document.createElement('summary');
        summary.textContent = m.whyLabel || this.whyLabel;
        const note = document.createElement('div');
        note.className = 'lk-conversation__note';
        note.innerHTML = m.why;
        details.append(summary, note);
        li.append(details);
      }

      list.append(li);
      return li;
    });

    root.append(list);

    const footer = document.createElement('div');
    footer.className = 'lk-conversation__footer';
    const status = document.createElement('p');
    status.className = 'lk-conversation__status';
    status.setAttribute('role', 'status');
    const moves = document.createElement('p');
    moves.className = 'lk-conversation__moves';
    moves.hidden = true;
    moves.textContent = movesSentence(summariseMoves(thread.messages));

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'lk-button';
    more.dataset.variant = 'primary';
    more.textContent = 'Show next message';
    more.addEventListener('click', () => this.revealNext(index));
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'lk-button';
    again.textContent = 'Start again';
    again.addEventListener('click', () => this.reset());

    const buttons = document.createElement('div');
    buttons.className = 'lk-conversation__buttons';
    buttons.append(more, again);
    footer.append(buttons, status, moves);
    if (this.stepped) root.append(footer);
    else if (moves.textContent) {
      moves.hidden = false;
      root.append(moves);
    }

    const total = thread.messages.length;
    return { root, items, more, again, buttons, status, moves, total, shown: this.stepped ? Math.min(1, total) : total };
  }

  #sync(index) {
    const view = this.views[index];
    view.items.forEach((li, i) => {
      li.hidden = i >= view.shown;
    });
    if (!this.stepped) return;
    const done = view.shown >= view.total;
    view.status.textContent = stepStatus(view.shown, view.total);
    view.more.hidden = done;
    view.again.hidden = view.shown <= 1;
    view.moves.hidden = !done || !view.moves.textContent;
  }
}

define('lk-conversation', LkConversation);
