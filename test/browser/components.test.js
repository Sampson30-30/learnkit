import { test, assert, equal, mount, click, press, listen, tick, waitFor } from './harness.js';

// ---- lk-tabs ----

test('tabs: builds tablist and selects first tab', async () => {
  const el = await mount(`<lk-tabs label="T"><div data-lk-tab="A">a</div><div data-lk-tab="B">b</div></lk-tabs>`);
  const tabs = el.querySelectorAll('[role=tab]');
  equal(tabs.length, 2);
  equal(el.selectedIndex, 0);
  assert(el.querySelectorAll('[role=tabpanel]')[1].hidden);
});

test('tabs: arrow keys move and wrap, event fires', async () => {
  const el = await mount(`<lk-tabs><div data-lk-tab="A">a</div><div data-lk-tab="B">b</div></lk-tabs>`);
  const seen = listen(el, 'lk-tabchange');
  const tabs = el.querySelectorAll('[role=tab]');
  tabs[0].focus();
  press(tabs[0], 'ArrowLeft');
  equal(el.selectedIndex, 1);
  equal(seen.length, 1);
  press(document.activeElement, 'Home');
  equal(el.selectedIndex, 0);
});

// ---- lk-accordion ----

test('accordion: single mode closes others', async () => {
  const el = await mount(`<lk-accordion><div data-lk-item="A" open>a</div><div data-lk-item="B">b</div></lk-accordion>`);
  equal(el.openIndexes, [0]);
  click(el.querySelectorAll('button')[1]);
  equal(el.openIndexes, [1]);
});

test('accordion: multiple mode keeps several open and reports events', async () => {
  const el = await mount(`<lk-accordion multiple level="4"><div data-lk-item="A" open>a</div><div data-lk-item="B">b</div></lk-accordion>`);
  const seen = listen(el, 'lk-toggle');
  click(el.querySelectorAll('button')[1]);
  equal(el.openIndexes, [0, 1]);
  equal(seen[0], { index: 1, title: 'B', open: true });
  equal(el.querySelector('[role=heading]').getAttribute('aria-level'), '4');
});

test('accordion: arrow keys move focus between headings', async () => {
  const el = await mount(`<lk-accordion><div data-lk-item="A">a</div><div data-lk-item="B">b</div></lk-accordion>`);
  const buttons = el.querySelectorAll('button');
  buttons[0].focus();
  press(buttons[0], 'ArrowDown');
  assert(document.activeElement === buttons[1], 'focus moved');
});

// ---- lk-modal ----

test('modal: opens from trigger, closes with Escape-equivalent, returns focus', async () => {
  const wrap = await mount(`<div><button id="opener" data-lk-open="m1">Open</button><lk-modal id="m1" heading="Hi"><p>Body</p></lk-modal></div>`);
  const opener = wrap.querySelector('#opener');
  const modal = wrap.querySelector('lk-modal');
  const seen = listen(modal, 'lk-close');
  opener.focus();
  opener.click();
  assert(modal.isOpen, 'open');
  assert(modal.dialog.getAttribute('aria-labelledby'), 'labelled');
  modal.close('ok');
  await waitFor(() => seen.length > 0);
  assert(!modal.isOpen, 'closed');
  equal(seen[0], { returnValue: 'ok' });
  assert(document.activeElement === opener, 'focus returned');
});

// ---- buttons and badges (CSS only) ----

test('button: variants resolve to token colours', async () => {
  const wrap = await mount(`<div><button class="lk-button" data-variant="primary">Go</button><span class="lk-badge" data-tone="danger">Error</span></div>`);
  const btn = wrap.querySelector('.lk-button');
  const badge = wrap.querySelector('.lk-badge');
  assert(getComputedStyle(btn).minHeight === '40px', 'touch target height');
  assert(getComputedStyle(btn).backgroundColor !== 'rgba(0, 0, 0, 0)', 'primary has fill');
  assert(getComputedStyle(badge).borderTopWidth === '1px');
});

// ---- lk-field and lk-choices ----

test('field: wires label, hint and error to the control', async () => {
  const el = await mount(`<lk-field label="Email" hint="We reply here"><input type="email" required></lk-field>`);
  const input = el.querySelector('input');
  const label = el.querySelector('label');
  assert(label.htmlFor === input.id, 'label for');
  const described = input.getAttribute('aria-describedby').split(' ');
  equal(described.length, 2);
  assert(label.textContent.includes('(required)'), 'required marker');
  el.setAttribute('error', 'Enter an email address');
  assert(input.getAttribute('aria-invalid') === 'true', 'invalid');
  assert(el.querySelector('.lk-field__error').textContent.includes('Enter an email address'));
  el.removeAttribute('error');
  assert(input.getAttribute('aria-invalid') === 'false', 'cleared');
});

test('field: validates on blur using native rules', async () => {
  const el = await mount(`<lk-field label="Name"><input required></lk-field>`);
  const input = el.querySelector('input');
  input.dispatchEvent(new FocusEvent('blur'));
  assert(input.getAttribute('aria-invalid') === 'true', 'invalid after blur');
  input.value = 'Alex';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  assert(input.getAttribute('aria-invalid') === 'false', 'valid after typing');
});

test('field: range shows its value', async () => {
  const el = await mount(`<lk-field label="Confidence"><input type="range" min="0" max="10" value="4"></lk-field>`);
  const out = el.querySelector('output');
  equal(out.textContent, '4');
  const input = el.querySelector('input');
  input.value = '7';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  equal(out.textContent, '7');
});

test('choices: builds fieldset and enforces min', async () => {
  const el = await mount(`<lk-choices legend="Topics" min="2"><label><input type="checkbox" name="t"> A</label><label><input type="checkbox" name="t"> B</label></lk-choices>`);
  assert(el.querySelector('fieldset > legend').textContent === 'Topics');
  assert(el.validate() === false, 'fails with none checked');
  el.querySelectorAll('input').forEach((i) => (i.checked = true));
  assert(el.validate() === true, 'passes with two');
  assert(!el.hasAttribute('data-invalid'));
});

// ---- lk-progress and lk-stepper ----

test('progress: exposes progressbar semantics and updates', async () => {
  const el = await mount(`<lk-progress label="Course" value="25" show-value></lk-progress>`);
  const bar = el.querySelector('[role=progressbar]');
  equal(bar.getAttribute('aria-valuenow'), '25');
  equal(bar.getAttribute('aria-label'), 'Course');
  equal(el.querySelector('.lk-progress__text').textContent, '25%');
  el.setAttribute('value', '80');
  equal(bar.getAttribute('aria-valuenow'), '80');
  el.removeAttribute('value');
  assert(!bar.hasAttribute('aria-valuenow'), 'indeterminate has no value');
});

test('stepper: marks states and aria-current', async () => {
  const el = await mount(`<lk-stepper current="1" label="Steps"><ol><li>One</li><li>Two</li><li>Three</li></ol></lk-stepper>`);
  const steps = [...el.querySelectorAll('li')];
  equal(steps.map((s) => s.dataset.state), ['complete', 'current', 'upcoming']);
  assert(steps[1].getAttribute('aria-current') === 'step');
  assert(steps[0].textContent.includes('completed'));
  el.current = 2;
  equal(steps.map((s) => s.dataset.state), ['complete', 'complete', 'current']);
  assert(!steps[1].hasAttribute('aria-current'));
});

test('stepper: many steps become compact and keep every label for screen readers', async () => {
  const items = Array.from({ length: 8 }, (_, i) => `<li>A fairly long step name number ${i + 1}</li>`).join('');
  const el = await mount(`<lk-stepper current="3" label="Many"><ol>${items}</ol></lk-stepper>`);
  assert(el.hasAttribute('compact'), 'compact is added automatically');
  const labels = [...el.querySelectorAll('.lk-stepper__label')];
  const visible = labels.filter((l) => l.getBoundingClientRect().width > 4);
  equal(visible.length, 1);
  assert(visible[0].textContent.includes('number 4'), 'the current step is the one shown');
  assert(labels.every((l) => l.textContent.length > 10), 'hidden labels still have their text');
  const few = await mount(`<lk-stepper current="0" label="Few"><ol><li>One</li><li>Two</li><li>Three</li></ol></lk-stepper>`);
  assert(!few.hasAttribute('compact'), 'short lists are left alone');
});

// ---- lk-tooltip and lk-popover ----

test('tooltip: describes its target, opens on focus, closes on Escape', async () => {
  const wrap = await mount(`<div style="padding:100px"><button id="tt1">Help</button><lk-tooltip for="tt1">Opens the guide</lk-tooltip></div>`);
  const btn = wrap.querySelector('button');
  const tip = wrap.querySelector('lk-tooltip');
  assert(btn.getAttribute('aria-describedby') === tip.id, 'described by');
  equal(tip.getAttribute('role'), 'tooltip');
  btn.dispatchEvent(new FocusEvent('focus'));
  await tick(10);
  assert(tip.isOpen, 'open on focus');
  assert(tip.style.top !== '', 'positioned');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  assert(!tip.isOpen, 'closed on Escape');
});

test('popover: toggles from trigger with ARIA state and restores focus', async () => {
  const wrap = await mount(`<div style="padding:100px"><button id="pp1" data-lk-popover="pop1">More</button><lk-popover id="pop1" label="More info"><p>Text</p><a href="#x">Link</a></lk-popover></div>`);
  const btn = wrap.querySelector('button');
  const pop = wrap.querySelector('lk-popover');
  const seen = listen(pop, 'lk-open');
  btn.focus();
  btn.click();
  assert(pop.isOpen, 'open');
  equal(btn.getAttribute('aria-expanded'), 'true');
  equal(seen.length, 1);
  press(pop, 'Escape');
  assert(!pop.isOpen, 'closed');
  equal(btn.getAttribute('aria-expanded'), 'false');
  assert(document.activeElement === btn, 'focus restored');
  btn.click();
  btn.click();
  assert(!pop.isOpen, 'second click closes');
});

// ---- lk-toasts ----

test('toast: announces, auto-dismisses and reports why', async () => {
  const { toast } = await import('../../src/lk-toast.js');
  const t = toast('Progress saved', { tone: 'success', duration: 50 });
  const region = document.querySelector('lk-toasts');
  const seen = listen(region, 'lk-dismiss');
  equal(region.getAttribute('role'), 'region');
  equal(region.querySelector('[aria-live]') !== null, true);
  equal(t.element.getAttribute('role'), 'status');
  assert(t.element.textContent.startsWith('Done: Progress saved'), 'tone word first');
  await tick(120);
  assert(!t.element.isConnected, 'removed after timeout');
  equal(seen[0].reason, 'timeout');
});

test('toast: errors use alert role, stay until dismissed, support actions', async () => {
  const { toast } = await import('../../src/lk-toast.js');
  let undone = false;
  const t = toast('Course deleted', { tone: 'danger', action: { label: 'Undo', onClick: () => (undone = true) } });
  equal(t.element.getAttribute('role'), 'alert');
  await tick(50);
  assert(t.element.isConnected, 'still shown');
  t.element.querySelector('.lk-toast__action').click();
  assert(undone, 'action ran');
  assert(!t.element.isConnected, 'dismissed by action');
  const t2 = toast('Another', { duration: 0 });
  t2.element.querySelector('.lk-toast__close').click();
  assert(!t2.element.isConnected, 'dismissed by user');
});

// ---- lk-quiz ----

const QUIZ = `<lk-quiz label="Check" title="Quick check" shuffle>
  <div data-lk-question="Pick the right one">
    <div data-lk-option correct data-feedback="Well done">Right</div>
    <div data-lk-option>Wrong</div>
    <p data-lk-explanation>Because it is.</p>
  </div>
  <div data-lk-question="Pick both">
    <div data-lk-option correct>One</div>
    <div data-lk-option correct>Two</div>
    <div data-lk-option>Three</div>
  </div>
</lk-quiz>`;

const pick = (quiz, text) => [...quiz.querySelectorAll('label')].find((l) => l.textContent.trim().startsWith(text)).querySelector('input');
const button = (quiz, text) => [...quiz.querySelectorAll('button')].find((b) => b.textContent === text);

test('quiz: parses markup, requires an answer, gives feedback', async () => {
  const quiz = await mount(QUIZ);
  equal(quiz.querySelectorAll('input[type=radio]').length, 2);
  assert(quiz.textContent.includes('Question 1 of 2'));
  const answers = listen(quiz, 'lk-answer');
  button(quiz, 'Check answer').click();
  assert(!quiz.querySelector('.lk-quiz__error').hidden, 'asks for an answer');
  equal(answers.length, 0);
  pick(quiz, 'Right').click();
  button(quiz, 'Check answer').click();
  equal(answers[0].correct, true);
  assert(quiz.querySelector('.lk-quiz__result').textContent.includes('Correct.'));
  assert(quiz.querySelector('.lk-quiz__result').textContent.includes('Because it is.'));
  assert(quiz.textContent.includes('Well done'), 'per-option feedback');
  assert(quiz.querySelector('input').disabled, 'locked after checking');
});

test('quiz: multiple choice, results, completion event and retry', async () => {
  const quiz = await mount(QUIZ);
  const done = listen(quiz, 'lk-complete');
  pick(quiz, 'Wrong').click();
  button(quiz, 'Check answer').click();
  assert(quiz.querySelector('.lk-quiz__result').textContent.includes('Not quite'));
  button(quiz, 'Next question').click();
  equal(quiz.querySelectorAll('input[type=checkbox]').length, 3);
  pick(quiz, 'One').click();
  button(quiz, 'Check answer').click();
  assert(quiz.querySelector('.lk-quiz__result').textContent.includes('1 of 2'), 'partial credit message');
  button(quiz, 'See your results').click();
  equal(done[0], { total: 2, correct: 0, percent: 0, points: 0.5 });
  assert(quiz.textContent.includes('You got 0 of 2 correct'));
  button(quiz, 'Try again').click();
  assert(quiz.textContent.includes('Question 1 of 2'), 'restarted');
});

test('quiz: reads JSON and reports bad data instead of throwing', async () => {
  const quiz = await mount(`<lk-quiz><script type="application/json">{"questions":[{"prompt":"Q?","options":["a","b"],"answer":1}]}</script></lk-quiz>`);
  equal(quiz.querySelectorAll('input').length, 2);
  const bad = await mount(`<lk-quiz><script type="application/json">{"questions":[{"prompt":"Q?"}]}</script></lk-quiz>`);
  assert(bad.textContent.includes('could not be shown'));
});

// ---- lk-journal ----

const JOURNAL = (name) => `<lk-journal name="${name}" title="Week 1 reflection">
  <div data-lk-prompt="What went well?" data-hint="One thing"></div>
  <div data-lk-prompt="What next?"></div>
</lk-journal>`;

test('journal: builds labelled text boxes and saves to storage', async () => {
  const name = `test-${Math.random().toString(36).slice(2)}`;
  const j = await mount(JOURNAL(name));
  const areas = j.querySelectorAll('textarea');
  equal(areas.length, 2);
  equal(j.querySelector('label').textContent, 'What went well?');
  areas[0].value = 'The planning';
  areas[0].dispatchEvent(new Event('input', { bubbles: true }));
  const saved = listen(j, 'lk-save');
  assert(j.save(), 'saved');
  equal(saved.length, 1);
  const stored = JSON.parse(localStorage.getItem(`lk-journal:${name}`));
  equal(stored.entries, { 0: 'The planning' });
  j.clear();
  assert(localStorage.getItem(`lk-journal:${name}`) === null, 'storage cleared');
  equal(areas[0].value, '');
});

test('journal: restores saved notes on load', async () => {
  const name = `test-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(`lk-journal:${name}`, JSON.stringify({ entries: { 1: 'Try pairs' } }));
  const j = await mount(JOURNAL(name));
  equal(j.querySelectorAll('textarea')[1].value, 'Try pairs');
  assert(j.querySelector('[role=status]').textContent.includes('restored'));
  j.clear();
});

test('journal: exports text and JSON, and confirms before clearing', async () => {
  const j = await mount(JOURNAL('export-test'));
  j.querySelectorAll('textarea')[0].value = 'Group work';
  const text = j.export('text');
  equal(text.filename, 'export-test.txt');
  assert(text.content.startsWith('# Week 1 reflection'), 'title');
  assert(text.content.includes('## What went well?\n\nGroup work'), 'answer');
  assert(text.content.includes('_No response._'), 'empty answer marked');
  const json = JSON.parse(j.export('json').content);
  equal(json.entries[0], { prompt: 'What went well?', text: 'Group work' });
  const clear = [...j.querySelectorAll('button')].find((b) => b.textContent === 'Clear all');
  clear.click();
  assert(j.querySelector('.lk-journal__confirm'), 'asks first');
  equal(j.querySelectorAll('textarea')[0].value, 'Group work');
  [...j.querySelectorAll('button')].find((b) => b.textContent === 'Keep my notes').click();
  equal(j.querySelectorAll('textarea')[0].value, 'Group work');
  j.clear();
});

// ---- lk-spectrum ----

test('spectrum: needs a position before comparing, then compares', async () => {
  const el = await mount(`<lk-spectrum statement="Feedback style" left="Written" right="Spoken" expert="70" explanation="Talk, then write it down."></lk-spectrum>`);
  const input = el.querySelector('input[type=range]');
  const revealed = listen(el, 'lk-reveal');
  equal(input.getAttribute('aria-label'), 'Feedback style');
  el.querySelector('button').click();
  assert(el.querySelector('.lk-spectrum__result').textContent.includes('Place your position first'));
  assert(el.querySelector('.lk-spectrum__marker').hidden, 'expert marker stays hidden');
  input.value = '62';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  assert(input.getAttribute('aria-valuetext').includes('Spoken'), 'position described in words');
  el.querySelector('button').click();
  assert(!el.querySelector('.lk-spectrum__marker').hidden, 'marker shown');
  assert(input.disabled, 'locked');
  assert(el.querySelector('.lk-spectrum__result').textContent.includes('8 points apart'));
  equal(revealed[0], { value: 62, expert: 70, difference: 8 });
  el.querySelector('button').click();
  assert(!input.disabled && el.querySelector('.lk-spectrum__marker').hidden, 'can change position');
});

// ---- lk-rating ----

test('rating: builds radio groups, remembers and summarises', async () => {
  const name = `rate-${Math.random().toString(36).slice(2)}`;
  const el = await mount(`<lk-rating label="Confidence" scale="5" low="Not at all" high="Completely" summary name="${name}">
    <div data-lk-statement="Planning"></div><div data-lk-statement="Feedback"></div></lk-rating>`);
  equal(el.querySelectorAll('fieldset').length, 2);
  equal(el.querySelectorAll('input[type=radio]').length, 10);
  assert(el.querySelector('.lk-rating__option').textContent.includes('Not at all'), 'low end is described to screen readers');
  const rated = listen(el, 'lk-rate');
  const summary = listen(el, 'lk-summary');
  const radios = (n) => [...el.querySelectorAll(`fieldset:nth-of-type(${n}) input`)];
  radios(1)[3].click();
  equal(rated[0], { index: 0, statement: 'Planning', value: 4 });
  assert(el.querySelector('.lk-rating__summary').hidden, 'no summary until complete');
  radios(2)[0].click();
  assert(!el.querySelector('.lk-rating__summary').hidden, 'summary shown');
  assert(el.querySelector('.lk-rating__summary').textContent.includes('2.5 out of 5'));
  assert(el.querySelector('.lk-rating__summary').textContent.includes('Feedback'), 'focus area named');
  equal(summary[0].focus, ['Feedback']);
  equal(JSON.parse(localStorage.getItem(`lk-rating:${name}`)), [4, 1]);
  el.reset();
  assert(localStorage.getItem(`lk-rating:${name}`) === null, 'storage cleared');
});

// ---- lk-timeline ----

test('timeline: builds an ordered list; collapsible items toggle', async () => {
  const el = await mount(`<lk-timeline label="History" collapsible>
    <div data-lk-date="1962" data-title="Founded">First classes.</div>
    <div data-lk-date="1990" data-title="Campus">New campus.</div></lk-timeline>`);
  equal(el.querySelectorAll('ol > li').length, 2);
  equal(el.querySelector('ol').getAttribute('aria-label'), 'History');
  const first = el.querySelector('button');
  equal(first.getAttribute('aria-expanded'), 'false');
  const seen = listen(el, 'lk-toggle');
  first.click();
  equal(first.getAttribute('aria-expanded'), 'true');
  assert(!document.getElementById(first.getAttribute('aria-controls')).hidden, 'body shown');
  equal(seen[0], { index: 0, title: 'Founded', open: true });
});

test('timeline: stepped mode reveals one event at a time', async () => {
  const el = await mount(`<lk-timeline stepped><div data-lk-date="A" data-title="One">1</div><div data-lk-date="B" data-title="Two">2</div><div data-lk-date="C" data-title="Three">3</div></lk-timeline>`);
  const items = [...el.querySelectorAll('li')];
  equal(items.map((i) => i.hidden), [false, true, true]);
  const seen = listen(el, 'lk-reveal');
  const more = [...el.querySelectorAll('button')].find((b) => b.textContent === 'Show next event');
  more.click();
  more.click();
  equal(items.map((i) => i.hidden), [false, false, false]);
  assert(more.hidden, 'button hides when done');
  equal(seen[1].remaining, 0);
  assert(el.textContent.includes('All 3 events'), 'status');
});

// ---- lk-grid-explorer ----

test('grid explorer: opens details, tracks exploration, completes', async () => {
  const el = await mount(`<lk-grid-explorer label="Theories" columns="2">
    <div data-lk-cell="A">About A</div><div data-lk-cell="B">About B</div></lk-grid-explorer>`);
  const tiles = el.querySelectorAll('.lk-grid__tile');
  const explored = listen(el, 'lk-explore');
  const done = listen(el, 'lk-complete');
  assert(el.querySelector('.lk-grid__detail').hidden, 'closed at first');
  tiles[0].click();
  equal(tiles[0].getAttribute('aria-expanded'), 'true');
  assert(el.querySelector('.lk-grid__detail').textContent.includes('About A'));
  assert(el.textContent.includes('1 of 2 explored'));
  tiles[0].click();
  assert(el.querySelector('.lk-grid__detail').hidden, 'toggles closed');
  equal(done.length, 0);
  tiles[1].click();
  equal(done[0], { explored: 2, total: 2 });
  equal(explored.length, 2);
  assert(tiles[0].textContent.includes('(explored)'), 'screen reader status');
  press(el.querySelector('.lk-grid__detail'), 'Escape');
  assert(el.querySelector('.lk-grid__detail').hidden, 'Escape closes');
});

// ---- lk-process ----

test('process: shows one step at a time and completes', async () => {
  const el = await mount(`<lk-process label="Plan"><div data-lk-step="Outcome">First</div><div data-lk-step="Activities">Second</div></lk-process>`);
  const panels = [...el.querySelectorAll('.lk-process__step')];
  equal(panels.map((p) => p.hidden), [false, true]);
  assert(el.textContent.includes('Step 1 of 2'));
  const steps = listen(el, 'lk-step');
  const done = listen(el, 'lk-complete');
  const button = (t) => [...el.querySelectorAll('button')].find((b) => b.textContent === t);
  assert(button('Previous step').disabled, 'cannot go back from the first step');
  button('Next step').click();
  equal(panels.map((p) => p.hidden), [true, false]);
  equal(el.querySelector('lk-stepper').getAttribute('current'), '1');
  equal(steps.at(-1), { index: 1, title: 'Activities' });
  button('Finish').click();
  equal(done[0], { steps: 2 });
  assert(el.textContent.includes('completed all 2 steps'));
  button('Start again').click();
  assert(!panels[0].hidden, 'restarted');
});

// ---- lk-scenario ----

const SCENARIO = `<lk-scenario label="Late work" start="start">
  <div data-lk-node="start" data-title="An email arrives"><p>A learner asks for more time.</p>
    <ul data-lk-choices><li data-lk-goto="no">Say no</li><li data-lk-goto="yes">Agree an extension</li></ul></div>
  <div data-lk-node="no" data-end data-outcome="poor" data-title="Disengaged"><p>They stop attending.</p></div>
  <div data-lk-node="yes" data-end data-outcome="good" data-title="Caught up"><p>They submit on the new date.</p></div>
</lk-scenario>`;

test('scenario: follows choices to an ending and reports the path', async () => {
  const el = await mount(SCENARIO);
  const choices = listen(el, 'lk-choose');
  const ends = listen(el, 'lk-end');
  assert(el.textContent.includes('A learner asks for more time.'));
  const buttons = () => [...el.querySelectorAll('.lk-scenario__choice')];
  equal(buttons().map((b) => b.textContent), ['Say no', 'Agree an extension']);
  buttons()[1].click();
  equal(choices[0], { from: 'start', to: 'yes', choice: 'Agree an extension', path: ['Agree an extension'] });
  assert(el.textContent.includes('Best outcome'), 'outcome word');
  assert(el.textContent.includes('They submit on the new date.'));
  equal(ends[0], { node: 'yes', outcome: 'good', path: ['Agree an extension'] });
  assert(el.textContent.includes('Your choices'), 'review of the path');
  [...el.querySelectorAll('button')].find((b) => b.textContent === 'Go back one step').click();
  equal(buttons().length, 2);
  buttons()[0].click();
  assert(el.textContent.includes('Poor outcome'));
  [...el.querySelectorAll('button')].find((b) => b.textContent === 'Try again').click();
  assert(el.textContent.includes('Decision 1'), 'restarted');
});

test('scenario: reads JSON and survives bad data', async () => {
  const ok = await mount(`<lk-scenario label="J"><script type="application/json">{"start":"a","nodes":{"a":{"text":"Hello","choices":[{"text":"On","goto":"b"}]},"b":{"text":"Bye","end":true}}}</script></lk-scenario>`);
  assert(ok.textContent.includes('Hello'));
  const bad = await mount(`<lk-scenario label="B"><script type="application/json">{"nodes":{}}</script></lk-scenario>`);
  assert(bad.textContent.includes('could not be shown'));
});

// ---- customiser layout ----

test('customiser: the sticky preview stays in view and never slides over the contrast checks', async () => {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:absolute;left:-9999px;top:0;width:1300px;height:900px;border:0';
  frame.src = '../../customiser/';
  document.body.append(frame);
  await new Promise((resolve) => { frame.onload = resolve; });
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  try {
    await waitFor(() => doc.querySelectorAll('#colours .token-row').length > 0, 3000);
    const preview = doc.querySelector('.preview-wrap');
    const below = doc.querySelector('.checks');
    // The preview sticks 12px below the site header, which stays in view above it.
    const stuckAt = () => doc.querySelector('site-nav').getBoundingClientRect().height + 12;
    let stuck = 0;
    const overlaps = [];
    for (let y = 0; y <= doc.documentElement.scrollHeight; y += 150) {
      win.scrollTo(0, y);
      await tick(20);
      const a = preview.getBoundingClientRect();
      const b = below.getBoundingClientRect();
      if (Math.abs(a.top - stuckAt()) < 2) stuck += 1;
      if (a.bottom > b.top + 1 && a.top < b.bottom) overlaps.push(y);
    }
    equal(overlaps, []);
    assert(stuck > 0, 'the preview should stay in view while the settings scroll');
    equal(win.getComputedStyle(doc.querySelector('#preview')).overscrollBehaviorY, 'contain');
  } finally {
    frame.remove();
  }
});
