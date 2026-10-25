import { LkElement, define } from './core/base.js';
import { clamp } from './core/utils.js';
import { choose, checkResponses, chosenLead, verdictLead, verdictDetail, unansweredMessage, summaryMessage } from './core/respond.js';

/**
 * <lk-respond> shows a set of situations, such as posts in a feed. For each one
 * the learner picks a response, reads what would happen, then checks them all
 * together. More than one response can be suitable for a situation.
 *
 *   <lk-respond label="Your feed" question="What would you do?" level="3">
 *     <div data-lk-case="Post 1 from a local account" data-kind="Public post">
 *       <p>"The council has cancelled every election. Share this before it is deleted!"</p>
 *       <div data-lk-action="Engage">Sharing spreads an unchecked claim.</div>
 *       <div data-lk-action="Challenge" correct>Ask for evidence, calmly.</div>
 *       <div data-lk-action="Ignore">You avoid amplifying it, but others may believe it.</div>
 *       <p data-lk-explanation>Check credible sources before sharing.</p>
 *     </div>
 *   </lk-respond>
 *
 * Everything in a case that is not an action or an explanation is shown as the
 * situation. Mark every suitable response with `correct`. Each case needs at
 * least two responses and one marked `correct`; a case that does not is skipped,
 * and the console says why.
 *
 * The learner can change their mind until they press "Check answers", which
 * marks each case in words as well as colour. "Reset" clears everything and
 * returns focus to the first response.
 *
 * Attributes:
 *   label              Accessible name for the whole activity. Required.
 *   question           The question under each situation (default "What would you do?").
 *   level              Heading level for each case title, 1 to 6 (default 3).
 *   explanation-label  Optional words shown before each explanation, such as "Why".
 *
 * Events: lk-respond { index, action }, lk-check { score, total, complete }.
 * Methods: choose(index, action), check(), reset(). `el.answers` reads every choice.
 */
export class LkRespond extends LkElement {
  setup() {
    this.cases = [...this.querySelectorAll(':scope > [data-lk-case]')].map((source, index) => this.#read(source, index)).filter(Boolean);
    if (!this.cases.length) return;

    this.question = this.getAttribute('question') || 'What would you do?';
    this.level = clamp(parseInt(this.getAttribute('level'), 10) || 3, 1, 6);
    this.explanationLabel = this.getAttribute('explanation-label');

    const id = this.makeId();
    const feed = document.createElement('div');
    feed.className = 'lk-respond__feed';
    this.views = this.cases.map((c, i) => this.#build(c, i, `${id}-${i}`));
    feed.append(...this.views.map((v) => v.article));

    this.status = document.createElement('p');
    this.status.className = 'lk-respond__status';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');

    const controls = document.createElement('div');
    controls.className = 'lk-respond__controls';
    controls.append(this.#button('Check answers', 'primary', () => this.check()), this.#button('Reset', '', () => this.reset()));

    this.setAttribute('role', 'group');
    this.setAttribute('aria-label', this.getAttribute('label') || 'Choose a response');
    this.replaceChildren(feed, controls, this.status);
    this.choices = this.cases.map(() => null);
  }

  /** The response chosen for every case, or null where there is none yet. */
  get answers() {
    return [...this.choices];
  }

  /** Choose a response for a case, as the learner would. */
  choose(index, action) {
    const c = this.cases[index];
    if (!c || !c.actions.some((a) => a.name === action)) return;
    const next = choose(this.choices, index, action);
    if (next === this.choices) return;
    this.choices = next;
    const view = this.views[index];
    const chosen = c.actions.find((a) => a.name === action);
    view.buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === action)));
    view.outcome.hidden = false;
    view.outcomeLead.textContent = chosenLead(action);
    view.outcomeDetail.innerHTML = chosen.html;
    view.outcomeWhy.innerHTML = c.explanation;
    view.outcomeWhy.hidden = !c.explanation;
    if (c.explanation && this.explanationLabel) view.outcomeWhy.prepend(`${this.explanationLabel}: `);
    view.result.hidden = true;
    this.status.textContent = '';
    this.emit('respond', { index, action });
  }

  /** Mark every case now, as if the learner had pressed "Check answers". */
  check() {
    const result = checkResponses(this.choices, this.cases);
    if (result.unanswered) {
      this.status.textContent = unansweredMessage(result.unanswered);
      return;
    }
    result.marks.forEach((mark, i) => {
      const { result: box, resultLead, resultDetail } = this.views[i];
      box.hidden = false;
      box.dataset.state = mark;
      resultLead.textContent = verdictLead(mark);
      resultDetail.textContent = verdictDetail(mark, this.cases[i].accepted);
    });
    this.status.textContent = summaryMessage(result);
    this.emit('check', { score: result.score, total: result.total, complete: result.complete });
  }

  /** Clear every choice and mark, and return focus to the first response. */
  reset() {
    this.choices = this.cases.map(() => null);
    for (const view of this.views) {
      view.buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      view.outcome.hidden = true;
      view.result.hidden = true;
      delete view.result.dataset.state;
    }
    this.status.textContent = 'Activity reset. Choose a response for each one.';
    this.views[0].buttons[0].focus();
  }

  /** Reads one case from the markup, or returns null (with a reason) if it cannot work. */
  #read(source, index) {
    const title = source.getAttribute('data-lk-case').trim();
    const actions = [...source.querySelectorAll(':scope > [data-lk-action]')].map((a) => ({
      name: a.getAttribute('data-lk-action').trim(),
      html: a.innerHTML,
      correct: a.hasAttribute('correct'),
    }));
    const where = `<lk-respond> case ${index + 1}${title ? ` ("${title}")` : ''}`;
    if (actions.length < 2) return void console.warn(`${where} needs at least two data-lk-action responses, so it was skipped.`);
    if (!actions.some((a) => a.correct)) return void console.warn(`${where} has no response marked "correct", so it was skipped.`);
    const explanation = source.querySelector(':scope > [data-lk-explanation]');
    const stem = [...source.childNodes].filter((n) => !(n.nodeType === 1 && (n.hasAttribute('data-lk-action') || n.hasAttribute('data-lk-explanation'))));
    return {
      title,
      kind: source.getAttribute('data-kind'),
      stem,
      actions,
      accepted: actions.filter((a) => a.correct).map((a) => a.name),
      explanation: explanation ? explanation.innerHTML : '',
    };
  }

  #build(c, index, id) {
    const article = document.createElement('article');
    article.className = 'lk-respond__case';

    const head = document.createElement('div');
    head.className = 'lk-respond__head';
    const title = document.createElement(`h${this.level}`);
    title.className = 'lk-respond__title';
    title.id = `${id}-title`;
    title.textContent = c.title;
    head.append(title);
    if (c.kind) {
      const kind = document.createElement('span');
      kind.className = 'lk-respond__kind';
      kind.textContent = c.kind;
      head.append(kind);
    }
    article.setAttribute('aria-labelledby', title.id);

    const body = document.createElement('div');
    body.className = 'lk-respond__body';
    const stem = document.createElement('div');
    stem.className = 'lk-respond__stem';
    stem.append(...c.stem);
    const question = document.createElement('p');
    question.className = 'lk-respond__question';
    question.textContent = this.question;

    const group = document.createElement('div');
    group.className = 'lk-respond__choices';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `Choose a response for ${c.title}`);
    const buttons = c.actions.map((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lk-button lk-respond__choice';
      b.textContent = a.name;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => this.choose(index, a.name));
      return b;
    });
    group.append(...buttons);

    const outcome = document.createElement('div');
    outcome.className = 'lk-respond__outcome';
    outcome.hidden = true;
    const outcomeLead = document.createElement('strong');
    const outcomeDetail = document.createElement('p');
    const outcomeWhy = document.createElement('p');
    outcome.append(outcomeLead, outcomeDetail, outcomeWhy);

    const result = document.createElement('div');
    result.className = 'lk-respond__result';
    result.hidden = true;
    const resultLead = document.createElement('strong');
    const resultDetail = document.createElement('p');
    result.append(resultLead, resultDetail);

    body.append(stem, question, group, outcome, result);
    article.append(head, body);
    return { article, buttons, outcome, outcomeLead, outcomeDetail, outcomeWhy, result, resultLead, resultDetail };
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

define('lk-respond', LkRespond);
