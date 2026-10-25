import { test, assert, equal, mount, click, press, listen, dragBetween } from './harness.js';

const buttonText = (el) => [...el.querySelectorAll('button')].map((b) => b.textContent);
const find = (el, text) => [...el.querySelectorAll('button')].find((b) => b.textContent === text);

// ---- lk-flashcards ----

const CARDS = `<lk-flashcards label="Terms">
  <div data-lk-card="Formative">During learning</div>
  <div data-lk-card="Summative">At the end</div>
</lk-flashcards>`;

test('flashcards: shows a front first and reveals the back on request', async () => {
  const el = await mount(CARDS);
  equal(el.getAttribute('role'), 'group');
  equal(el.querySelector('.lk-flashcards__front').textContent, 'Formative');
  assert(!el.querySelector('.lk-flashcards__back'), 'back hidden');
  equal(buttonText(el), ['Show answer']);
  click(find(el, 'Show answer'));
  equal(el.querySelector('.lk-flashcards__back').textContent, 'During learning');
  equal(buttonText(el), ['I knew it', 'Not yet']);
  assert(document.activeElement.textContent === 'I knew it', 'focus moves to the answer buttons');
});

test('flashcards: a missed card comes round again and the run finishes with a summary', async () => {
  const el = await mount(CARDS);
  const answers = listen(el, 'lk-cardanswer');
  const done = listen(el, 'lk-deckcomplete');
  click(find(el, 'Show answer'));
  click(find(el, 'Not yet')); // Formative missed
  equal(el.querySelector('.lk-flashcards__front').textContent, 'Summative');
  click(find(el, 'Show answer'));
  click(find(el, 'I knew it'));
  equal(el.querySelector('.lk-flashcards__front').textContent, 'Formative');
  click(find(el, 'Show answer'));
  click(find(el, 'I knew it'));
  equal(answers.map((a) => a.known), [false, true, true]);
  assert(el.querySelector('.lk-flashcards__result').textContent.includes('You knew 1 of 2 the first time'));
  equal(done, [{ total: 2, firstTime: 1 }]);
  equal(buttonText(el), ['Practise the 1 I missed', 'Start again']);
});

test('flashcards: practise the missed ones, and start again', async () => {
  const el = await mount(CARDS);
  click(find(el, 'Show answer'));
  click(find(el, 'Not yet'));
  click(find(el, 'Show answer'));
  click(find(el, 'I knew it'));
  click(find(el, 'Show answer'));
  click(find(el, 'I knew it'));
  click(find(el, 'Practise the 1 I missed'));
  equal(el.querySelector('.lk-flashcards__front').textContent, 'Formative');
  assert(el.querySelector('.lk-flashcards__count').textContent.includes('0 of 1'));
  el.restart();
  assert(el.querySelector('.lk-flashcards__count').textContent.includes('0 of 2'));
});

test('flashcards: shuffle keeps every card', async () => {
  const el = await mount(`<lk-flashcards label="T" shuffle><div data-lk-card="A">a</div><div data-lk-card="B">b</div><div data-lk-card="C">c</div></lk-flashcards>`);
  const seen = [];
  for (let i = 0; i < 3; i++) {
    seen.push(el.querySelector('.lk-flashcards__front').textContent);
    click(find(el, 'Show answer'));
    click(find(el, 'I knew it'));
  }
  equal(seen.sort(), ['A', 'B', 'C']);
});

// ---- lk-order ----

const ORDER = `<lk-order label="Writing process"><ol><li>Plan</li><li>Draft</li><li>Revise</li><li>Publish</li></ol></lk-order>`;
const rows = (el) => [...el.querySelectorAll('.lk-order__item')];

/** Puts the items in the correct order using only the buttons. */
function solve(el) {
  for (let target = 0; target < el.order.length; target++) {
    let at = el.order.indexOf(target);
    while (at > target) {
      click(rows(el)[at].querySelector('[data-move=up]'));
      at -= 1;
    }
  }
}

test('order: items are shuffled, labelled, and never start in the right order', async () => {
  const el = await mount(ORDER);
  equal(rows(el).length, 4);
  equal(el.querySelector('ol').getAttribute('aria-labelledby'), el.querySelector('.lk-order__label').id);
  assert(!el.order.every((v, i) => v === i), 'not already solved');
  equal([...el.sequence].sort(), ['Draft', 'Plan', 'Publish', 'Revise']);
});

test('order: move buttons are named, disabled at the ends and announce the move', async () => {
  const el = await mount(ORDER);
  const first = rows(el)[0].querySelector('[data-move=up]');
  assert(first.disabled, 'cannot move the first item up');
  assert(rows(el)[3].querySelector('[data-move=down]').disabled, 'cannot move the last item down');
  const name = el.sequence[1];
  const seen = listen(el, 'lk-orderchange');
  const down = rows(el)[1].querySelector('[data-move=down]');
  equal(down.getAttribute('aria-label'), `Move ${name} down`);
  down.focus();
  click(down);
  equal(el.sequence[2], name);
  equal(el.querySelectorAll('[role=status]')[1].textContent, `${name} moved to position 3 of 4`);
  assert(document.activeElement.dataset.move === 'down' && document.activeElement.closest('li').dataset.position === '2', 'focus follows the item');
  equal(seen.length, 1);
});

test('order: checking marks wrong items in words, then solving it is correct', async () => {
  const el = await mount(ORDER);
  const checks = listen(el, 'lk-check');
  click(find(el, 'Check order'));
  assert(rows(el).some((r) => r.dataset.state === 'wrong'));
  assert(rows(el).every((r) => r.querySelector('.lk-order__mark').textContent.length > 4), 'every row says right or wrong in words');
  assert(el.querySelector('.lk-order__feedback').textContent.includes('in the right place'));
  solve(el);
  equal(el.sequence, ['Plan', 'Draft', 'Revise', 'Publish']);
  click(find(el, 'Check order'));
  assert(rows(el).every((r) => r.dataset.state === 'correct'));
  assert(el.querySelector('.lk-order__feedback').textContent.startsWith('Correct.'));
  equal(checks[1], { score: 4, total: 4, complete: true });
});

test('order: moving an item clears the marks, and dragging reorders', async () => {
  const el = await mount(ORDER);
  click(find(el, 'Check order'));
  const moved = rows(el)[3].querySelector('[data-move=up]');
  click(moved);
  assert(rows(el).every((r) => !r.dataset.state), 'marks cleared');
  const before = [...el.sequence];
  rows(el)[0].scrollIntoView({ block: 'center' });
  const from = rows(el)[0].querySelector('.lk-order__handle');
  const to = rows(el)[2].getBoundingClientRect();
  await dragBetween(from, { x: to.left + to.width / 2, y: to.top + to.height / 2 });
  equal(el.sequence, [before[1], before[2], before[0], before[3]]);
});

test('order: a pointer drag (a finger or a mouse) reorders, and a short press does nothing', async () => {
  const el = await mount(ORDER);
  rows(el)[0].scrollIntoView({ block: 'center' });
  const before = [...el.sequence];
  const handle = rows(el)[3].querySelector('.lk-order__handle');
  const at = handle.getBoundingClientRect();
  await dragBetween(handle, { x: at.left + at.width / 2, y: at.top + at.height / 2 });
  equal(el.sequence, before, 'a press without movement is not a drag');
  const top = rows(el)[0].getBoundingClientRect();
  await dragBetween(handle, { x: top.left + top.width / 2, y: top.top + top.height / 2 });
  equal(el.sequence, [before[3], before[0], before[1], before[2]]);
  assert(!document.querySelector('.lk-drag-ghost'), 'the floating copy is gone');
});

// ---- lk-hotspot ----

const HOTSPOT = `<lk-hotspot label="Plant">
  <svg viewBox="0 0 100 100" role="img" aria-label="A plant"><rect width="100" height="100" fill="#cde"/></svg>
  <div data-lk-spot data-x="50" data-y="15" data-title="Flower">Makes seeds.</div>
  <div data-lk-spot data-x="48" data-y="60" data-title="Stem">Carries water.</div>
</lk-hotspot>`;

test('hotspot: points are real buttons placed by percentage, with names', async () => {
  const el = await mount(HOTSPOT);
  const points = el.querySelectorAll('.lk-hotspot__point');
  equal(points.length, 2);
  equal(points[0].getAttribute('aria-label'), 'Flower');
  equal(points[0].style.left, '50%');
  equal(points[1].style.top, '60%');
  assert(el.querySelector('.lk-hotspot__detail').textContent.includes('Choose a numbered point'));
  equal(el.querySelector('.lk-hotspot__progress').textContent, '0 of 2 explored');
});

test('hotspot: choosing a point shows its text and marks it explored', async () => {
  const el = await mount(HOTSPOT);
  const seen = listen(el, 'lk-spot');
  const [a, b] = el.querySelectorAll('.lk-hotspot__point');
  click(b);
  assert(el.querySelector('.lk-hotspot__detail').textContent.includes('Carries water.'));
  equal(b.getAttribute('aria-current'), 'true');
  equal(b.getAttribute('aria-label'), 'Stem (explored)');
  assert(!a.hasAttribute('aria-current'));
  equal(el.querySelector('.lk-hotspot__progress').textContent, '1 of 2 explored');
  equal(seen, [{ index: 1, title: 'Stem' }]);
});

test('hotspot: exploring everything fires one completion event', async () => {
  const el = await mount(HOTSPOT);
  const done = listen(el, 'lk-allexplored');
  const [a, b] = el.querySelectorAll('.lk-hotspot__point');
  click(a);
  click(b);
  click(a);
  equal(done, [{ total: 2 }]);
  equal(el.querySelector('.lk-hotspot__progress').textContent, 'All 2 explored');
});

// ---- lk-matrix ----

const MATRIX = `<lk-matrix label="Theories" show-answers>
  <table>
    <thead><tr><th>Theory</th><th>Idea</th><th>Active</th></tr></thead>
    <tbody>
      <tr><th>Behaviourism</th><td data-answer="Habits|Behaviour">Behaviour</td><td data-tick="no"></td></tr>
      <tr><th>Constructivism</th><td data-answer="Meaning">Meaning</td><td data-tick="yes"></td></tr>
    </tbody>
  </table>
</lk-matrix>`;

test('matrix: answer cells become named boxes and the answers are not shown', async () => {
  const el = await mount(MATRIX);
  const boxes = el.querySelectorAll('input');
  equal(boxes.length, 4);
  equal(boxes[0].getAttribute('aria-label'), 'Behaviourism, Idea');
  equal(boxes[1].getAttribute('aria-label'), 'Behaviourism, Active');
  equal(boxes[0].type, 'text');
  equal(boxes[1].type, 'checkbox');
  assert(!el.textContent.includes('Meaning'), 'answer text removed from the page');
});

test('matrix: checking marks each cell in words and reports the score', async () => {
  const el = await mount(MATRIX);
  const seen = listen(el, 'lk-check');
  const boxes = el.querySelectorAll('input');
  boxes[0].value = 'behaviour';
  boxes[2].value = 'wrong';
  click(find(el, 'Check answers'));
  const words = [...el.querySelectorAll('.lk-matrix__mark')].map((m) => m.textContent);
  equal(words, ['Right', 'Right', 'Not quite', 'Not quite']);
  equal(seen[0], { score: 2, total: 4, complete: false });
  equal(boxes[2].getAttribute('aria-invalid'), 'true');
  assert(!find(el, 'Show answers').hidden, 'show answers offered');
});

test('matrix: changing a box clears its mark, and a full set of right answers completes', async () => {
  const el = await mount(MATRIX);
  const boxes = el.querySelectorAll('input');
  click(find(el, 'Check answers'));
  equal(boxes[0].dataset.mark, 'blank');
  boxes[0].value = 'Habits';
  boxes[0].dispatchEvent(new Event('input', { bubbles: true }));
  assert(!boxes[0].dataset.mark, 'mark cleared');
  boxes[2].value = 'meaning';
  boxes[3].checked = true;
  const seen = listen(el, 'lk-check');
  click(find(el, 'Check answers'));
  equal(seen[0], { score: 4, total: 4, complete: true });
  assert(find(el, 'Show answers').hidden, 'no reveal needed');
});

test('matrix: show answers fills and locks, and start again clears', async () => {
  const el = await mount(MATRIX);
  click(find(el, 'Check answers'));
  click(find(el, 'Show answers'));
  const boxes = el.querySelectorAll('input');
  equal(boxes[0].value, 'Habits');
  equal(boxes[3].checked, true);
  assert(boxes[0].disabled, 'locked');
  click(find(el, 'Start again'));
  equal(boxes[0].value, '');
  assert(!boxes[0].disabled, 'unlocked');
  equal(el.querySelector('.lk-matrix__feedback').textContent, '');
});

// ---- lk-glossary ----

const GLOSSARY = `<lk-glossary label="Terms">
  <dl>
    <dt>Moderation</dt><dd>Checking marking is fair.</dd>
    <dt>Feedback</dt><dd>Comments to help improve.</dd><dd>A reply.</dd>
    <dt>Criteria</dt><dd>Standards for judging work.</dd>
    <dt>Assessment</dt><dd>Judging what was learned.</dd>
  </dl>
</lk-glossary>`;

test('glossary: terms are sorted A to Z under letter headings, with a link for each letter', async () => {
  const el = await mount(GLOSSARY);
  equal([...el.querySelectorAll('dt')].map((t) => t.textContent), ['Assessment', 'Criteria', 'Feedback', 'Moderation']);
  equal([...el.querySelectorAll('.lk-glossary__heading')].map((h) => h.textContent), ['A', 'C', 'F', 'M']);
  equal([...el.querySelectorAll('.lk-glossary__letter')].map((a) => a.textContent), ['A', 'C', 'F', 'M']);
  equal(el.querySelectorAll('dd').length, 5);
  equal(el.querySelector('.lk-glossary__status').textContent, '4 terms');
});

test('glossary: searching hides other terms and empty letters, and announces the count', async () => {
  const el = await mount(GLOSSARY);
  const seen = listen(el, 'lk-filter');
  el.filter('improve');
  equal([...el.querySelectorAll('.lk-glossary__entry:not([hidden]) dt')].map((t) => t.textContent), ['Feedback']);
  equal([...el.querySelectorAll('.lk-glossary__letter:not([hidden])')].map((a) => a.textContent), ['F']);
  equal(el.querySelector('.lk-glossary__status').textContent, 'Showing 1 of 4 terms');
  equal(seen[0], { query: 'improve', shown: 1, total: 4 });
  el.filter('zzz');
  equal(el.querySelector('.lk-glossary__status').textContent, 'No terms match');
  assert(el.querySelector('nav').hidden, 'letters hidden when nothing matches');
  el.filter('');
  equal(el.querySelector('.lk-glossary__status').textContent, '4 terms');
});

test('glossary: choosing a letter moves focus to its heading', async () => {
  const el = await mount(GLOSSARY);
  click([...el.querySelectorAll('.lk-glossary__letter')].find((a) => a.textContent === 'M'));
  equal(document.activeElement.textContent, 'M');
  equal(document.activeElement.localName, 'h3');
});

// ---- lk-sort ----

const SORT = `<lk-sort label="Assessment">
  <ul data-lk-group="Formative"><li>Quiz</li><li>Feedback</li></ul>
  <ul data-lk-group="Summative"><li>Exam</li></ul>
</lk-sort>`;
const sortItem = (el, text) => [...el.querySelectorAll('.lk-sort__item')].find((li) => li.querySelector('.lk-sort__text').textContent === text);
const zoneOf = (el, text) => sortItem(el, text).closest('.lk-sort__zone');

test('sort: everything starts shuffled in the pile, and every item has a named Move to list', async () => {
  const el = await mount(SORT);
  equal(el.getAttribute('role'), 'group');
  equal(el.querySelectorAll('.lk-sort__pile .lk-sort__item').length, 3);
  equal(el.querySelectorAll('.lk-sort__board .lk-sort__item').length, 0);
  const select = sortItem(el, 'Exam').querySelector('select');
  equal(select.getAttribute('aria-label'), 'Move Exam to');
  equal([...select.options].map((o) => o.textContent), ['The pile', 'Formative', 'Summative']);
  equal(el.placed, [null, null, null]);
});

test('sort: the Move to list files an item, announces it and keeps focus on it', async () => {
  const el = await mount(SORT);
  const seen = listen(el, 'lk-sortchange');
  const select = sortItem(el, 'Exam').querySelector('select');
  select.value = '1';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  assert(zoneOf(el, 'Exam').dataset.group === '1', 'moved to Summative');
  equal(seen[0], { item: 2, group: 'Summative' });
  equal(el.querySelectorAll('[role=status]')[1].textContent, 'Exam moved to Summative');
  assert(document.activeElement === sortItem(el, 'Exam').querySelector('select'), 'focus follows the item');
  el.place(2, -1);
  equal(el.placed[2], null);
  equal(seen[1], { item: 2, group: null });
});

test('sort: checking marks items in words, moving one clears the marks, and a full set is correct', async () => {
  const el = await mount(SORT);
  const checks = listen(el, 'lk-check');
  el.place(0, 1); // Quiz in Summative: wrong
  el.place(1, 0); // Feedback in Formative: right
  click(find(el, 'Check answers'));
  equal(sortItem(el, 'Quiz').querySelector('.lk-sort__mark').textContent, 'Not here');
  equal(sortItem(el, 'Feedback').querySelector('.lk-sort__mark').textContent, 'Right group');
  equal(sortItem(el, 'Exam').querySelector('.lk-sort__mark').textContent, 'Not sorted yet');
  assert(el.querySelector('.lk-sort__feedback').textContent.includes('1 is not sorted yet'));
  el.place(0, 0);
  assert(!el.querySelector('.lk-sort__mark'), 'marks cleared');
  el.place(2, 1);
  click(find(el, 'Check answers'));
  equal(checks[1], { score: 3, total: 3, complete: true });
  assert(el.querySelector('.lk-sort__feedback').textContent.startsWith('Correct.'));
  click(find(el, 'Start again'));
  equal(el.placed, [null, null, null]);
});

test('sort: dragging an item by its handle onto a group files it', async () => {
  const el = await mount(SORT);
  sortItem(el, 'Exam').scrollIntoView({ block: 'center' });
  const handle = sortItem(el, 'Exam').querySelector('.lk-sort__handle');
  const zone = [...el.querySelectorAll('.lk-sort__zone')].find((z) => z.dataset.group === '1').getBoundingClientRect();
  await dragBetween(handle, { x: zone.left + zone.width / 2, y: zone.top + zone.height / 2 });
  assert(zoneOf(el, 'Exam').dataset.group === '1', 'dropped in Summative');
  assert(!document.querySelector('.lk-drag-ghost'), 'the floating copy is gone');
  // Dropping on empty page leaves it where it was.
  const again = sortItem(el, 'Exam').querySelector('.lk-sort__handle');
  await dragBetween(again, { x: 2, y: 2 });
  assert(zoneOf(el, 'Exam').dataset.group === '1', 'still in Summative');
});

test('sort: needs two groups and two items, otherwise it leaves the markup alone', async () => {
  const el = await mount(`<lk-sort label="x"><ul data-lk-group="Only"><li>One</li><li>Two</li></ul></lk-sort>`);
  assert(!el.querySelector('.lk-sort__board'), 'not built');
});

// ---- lk-respond ----

const RESPOND = `<lk-respond label="Your feed" question="What would you do?" explanation-label="Why">
  <div data-lk-case="Post 1" data-kind="Public post">
    <p>An unchecked claim.</p>
    <div data-lk-action="Engage">Spreads it.</div>
    <div data-lk-action="Challenge" correct>Ask for evidence.</div>
    <p data-lk-explanation>Check sources.</p>
  </div>
  <div data-lk-case="Post 2">
    <p>A fair disagreement.</p>
    <div data-lk-action="Engage" correct>Join in.</div>
    <div data-lk-action="Report" correct>Not needed, but allowed here.</div>
    <div data-lk-action="Ignore">Skip it.</div>
  </div>
</lk-respond>`;
const respondButton = (el, caseIndex, text) => [...el.querySelectorAll('.lk-respond__case')[caseIndex].querySelectorAll('.lk-respond__choice')].find((b) => b.textContent === text);

test('respond: builds a named group with a titled article and a button per response', async () => {
  const el = await mount(RESPOND);
  equal(el.getAttribute('role'), 'group');
  equal(el.getAttribute('aria-label'), 'Your feed');
  equal(el.querySelectorAll('.lk-respond__case').length, 2);
  equal(el.querySelector('h3.lk-respond__title').textContent, 'Post 1');
  equal(el.querySelector('.lk-respond__kind').textContent, 'Public post');
  equal(el.querySelector('.lk-respond__question').textContent, 'What would you do?');
  equal(el.querySelectorAll('.lk-respond__case')[1].querySelectorAll('.lk-respond__choice').length, 3);
  assert(el.querySelector('.lk-respond__stem').textContent.includes('An unchecked claim.'), 'the situation is kept');
  assert(!el.querySelector('[data-lk-action]'), 'the markup responses are replaced by buttons');
});

test('respond: choosing shows what would happen, and the learner can change their mind', async () => {
  const el = await mount(RESPOND);
  const seen = listen(el, 'lk-respond');
  click(respondButton(el, 0, 'Engage'));
  const outcome = el.querySelector('.lk-respond__outcome');
  assert(!outcome.hidden, 'outcome shown');
  assert(outcome.textContent.includes('You chose Engage.'), 'says what was chosen');
  assert(outcome.textContent.includes('Why: Check sources.'), 'the explanation is labelled');
  equal(respondButton(el, 0, 'Engage').getAttribute('aria-pressed'), 'true');
  click(respondButton(el, 0, 'Challenge'));
  equal(respondButton(el, 0, 'Engage').getAttribute('aria-pressed'), 'false');
  equal(respondButton(el, 0, 'Challenge').getAttribute('aria-pressed'), 'true');
  equal(el.answers, ['Challenge', null]);
  equal(seen[0], { index: 0, action: 'Engage' });
  equal(seen.length, 2);
});

test('respond: checking before every case is answered says how many are left and marks nothing', async () => {
  const el = await mount(RESPOND);
  const checks = listen(el, 'lk-check');
  click(respondButton(el, 0, 'Challenge'));
  click(find(el, 'Check answers'));
  assert(el.querySelector('[role=status]').textContent.includes('1 remains unanswered'), 'counts what is left');
  assert([...el.querySelectorAll('.lk-respond__result')].every((r) => r.hidden), 'nothing marked');
  equal(checks.length, 0);
});

test('respond: checking marks each case in words, and any suitable response counts', async () => {
  const el = await mount(RESPOND);
  const checks = listen(el, 'lk-check');
  click(respondButton(el, 0, 'Engage')); // wrong
  click(respondButton(el, 1, 'Report')); // one of two suitable responses
  click(find(el, 'Check answers'));
  const results = [...el.querySelectorAll('.lk-respond__result')];
  equal(results.map((r) => r.dataset.state), ['wrong', 'correct']);
  assert(results[0].textContent.startsWith('Not quite'), 'says it in words');
  assert(results[0].textContent.includes('A more suitable choice here: Challenge.'), 'names the suitable response');
  assert(results[1].textContent.startsWith('Correct'), 'a second suitable response is accepted');
  equal(checks[0], { score: 1, total: 2, complete: false });
  assert(el.querySelector('[role=status]').textContent.startsWith('1 of 2 decisions'), 'summarises');
  click(respondButton(el, 0, 'Challenge'));
  assert(results[0].hidden, 'changing a choice clears its old mark');
  click(find(el, 'Check answers'));
  equal(checks[1], { score: 2, total: 2, complete: true });
});

test('respond: reset clears everything and puts focus on the first response', async () => {
  const el = await mount(RESPOND);
  click(respondButton(el, 0, 'Engage'));
  click(respondButton(el, 1, 'Engage'));
  click(find(el, 'Reset'));
  equal(el.answers, [null, null]);
  assert([...el.querySelectorAll('.lk-respond__choice')].every((b) => b.getAttribute('aria-pressed') === 'false'), 'nothing pressed');
  assert([...el.querySelectorAll('.lk-respond__outcome')].every((o) => o.hidden), 'outcomes hidden');
  assert(document.activeElement === el.querySelector('.lk-respond__choice'), 'focus on the first response');
});

test('respond: a case with no suitable response, or fewer than two, is skipped', async () => {
  const el = await mount(`<lk-respond label="x">
    <div data-lk-case="No right answer"><div data-lk-action="A">a</div><div data-lk-action="B">b</div></div>
    <div data-lk-case="One response"><div data-lk-action="A" correct>a</div></div>
    <div data-lk-case="Fine"><div data-lk-action="A" correct>a</div><div data-lk-action="B">b</div></div>
  </lk-respond>`);
  equal(el.querySelectorAll('.lk-respond__case').length, 1);
  equal(el.querySelector('.lk-respond__title').textContent, 'Fine');
});

// ---- pick up and place ----

const ORDER_PICKUP = `<lk-order label="Writing process" pickup><ol><li>Plan</li><li>Draft</li><li>Revise</li><li>Publish</li></ol></lk-order>`;
const pickOf = (el, text) => el.querySelector(`.lk-pickup__pick[aria-label="Pick up ${text}"]`);
const placeButtons = (el) => [...el.querySelectorAll('.lk-pickup__place')].map((b) => b.textContent);

test('pickup: without the attribute there are no pick up or place buttons', async () => {
  const order = await mount(ORDER);
  const sort = await mount(SORT);
  assert(!order.querySelector('.lk-pickup__pick') && !sort.querySelector('.lk-pickup__pick'), 'nothing added');
});

test('pickup, order: Pick up shows a Place button on every other row and says what to do', async () => {
  const el = await mount(ORDER_PICKUP);
  equal(el.querySelectorAll('.lk-pickup__pick').length, 4);
  equal(placeButtons(el), []);
  const plan = pickOf(el, 'Plan');
  equal(plan.textContent, 'Pick up');
  click(plan);
  equal(pickOf(el, 'Plan').getAttribute('aria-pressed'), 'true');
  equal(placeButtons(el).length, 3);
  assert(!rows(el)[el.order.indexOf(0)].querySelector('.lk-pickup__place'), 'none on the held item');
  assert(el.querySelectorAll('[role=status]')[1].textContent.startsWith('Plan picked up.'), 'announced');
  assert(document.activeElement === pickOf(el, 'Plan'), 'focus stays on the item');
});

test('pickup, order: Place moves the item straight there, announces it and keeps focus on it', async () => {
  const el = await mount(ORDER_PICKUP);
  const seen = listen(el, 'lk-orderchange');
  const from = el.order.indexOf(3); // Publish
  const to = from === 0 ? 3 : 0;
  click(pickOf(el, 'Publish'));
  click([...el.querySelectorAll('.lk-pickup__place')].find((b) => b.textContent === `Place at position ${to + 1}`));
  equal(el.sequence[to], 'Publish');
  equal(el.querySelectorAll('[role=status]')[1].textContent, `Publish moved to position ${to + 1} of 4`);
  equal(placeButtons(el), []);
  assert(document.activeElement === pickOf(el, 'Publish'), 'focus follows the item');
  equal(seen.length, 1);
});

test('pickup, order: Pick up again or Escape puts it down without moving anything', async () => {
  const el = await mount(ORDER_PICKUP);
  const before = [...el.order];
  click(pickOf(el, 'Plan'));
  click(pickOf(el, 'Plan'));
  equal(placeButtons(el), []);
  equal(el.querySelectorAll('[role=status]')[1].textContent, 'Plan put down.');
  click(pickOf(el, 'Draft'));
  press(el, 'Escape');
  equal(placeButtons(el), []);
  assert(document.activeElement === pickOf(el, 'Draft'), 'focus back on the item');
  equal(el.order, before);
});

test('pickup, order: Shuffle again and Check order both put the item down', async () => {
  const el = await mount(ORDER_PICKUP);
  click(pickOf(el, 'Plan'));
  click(find(el, 'Check order'));
  equal(placeButtons(el), []);
  click(pickOf(el, 'Plan'));
  click(find(el, 'Shuffle again'));
  equal(placeButtons(el), []);
});

const SORT_PICKUP = `<lk-sort label="Assessment" pickup>
  <ul data-lk-group="Formative"><li>Quiz</li><li>Feedback</li></ul>
  <ul data-lk-group="Summative"><li>Exam</li></ul>
</lk-sort>`;

test('pickup, sort: Pick up offers a Place button under every group except where the item is', async () => {
  const el = await mount(SORT_PICKUP);
  equal(el.querySelectorAll('.lk-pickup__pick').length, 3);
  click(pickOf(el, 'Exam'));
  equal(placeButtons(el), ['Place in Formative', 'Place in Summative']);
  assert(el.querySelectorAll('.lk-sort__zone[data-target]').length === 2, 'the places it can go are marked');
  assert(sortItem(el, 'Exam').hasAttribute('data-picked'), 'the held item is marked');
  assert(el.querySelectorAll('[role=status]')[1].textContent.startsWith('Exam picked up.'), 'announced');
});

test('pickup, sort: Place files the item, announces it, and offers the pile once it is in a group', async () => {
  const el = await mount(SORT_PICKUP);
  const seen = listen(el, 'lk-sortchange');
  click(pickOf(el, 'Exam'));
  click([...el.querySelectorAll('.lk-pickup__place')].find((b) => b.textContent === 'Place in Summative'));
  assert(zoneOf(el, 'Exam').dataset.group === '1', 'in Summative');
  equal(el.querySelectorAll('[role=status]')[1].textContent, 'Exam moved to Summative');
  equal(placeButtons(el), []);
  assert(document.activeElement === pickOf(el, 'Exam'), 'focus follows the item');
  equal(seen[0], { item: 2, group: 'Summative' });
  click(pickOf(el, 'Exam'));
  equal(placeButtons(el), ['Place back in the pile', 'Place in Formative']);
});

test('pickup, sort: Escape puts the item down and checking clears what is held', async () => {
  const el = await mount(SORT_PICKUP);
  click(pickOf(el, 'Quiz'));
  press(el, 'Escape');
  equal(placeButtons(el), []);
  equal(el.placed, [null, null, null]);
  click(pickOf(el, 'Quiz'));
  click(find(el, 'Check answers'));
  equal(placeButtons(el), []);
});

// ---- lk-conversation ----

const CONVERSATION = `<lk-conversation label="Checking a claim" example stepped>
  <div data-lk-from="Chatbot">Research shows it works.</div>
  <div data-lk-from="You" data-move="Ask for evidence">Which study?<p data-lk-why>Names no source.</p></div>
  <div data-lk-from="Chatbot">None I am sure of.</div>
  <div data-lk-from="You" data-move="Check the source">Then where do I check?</div>
</lk-conversation>`;
const messages = (el) => [...el.querySelectorAll('.lk-conversation__message')];

test('conversation: builds a named group, says it is an example, and starts with one message', async () => {
  const el = await mount(CONVERSATION);
  equal(el.getAttribute('role'), 'group');
  equal(el.getAttribute('aria-label'), 'Checking a claim');
  assert(el.querySelector('.lk-conversation__example').textContent.includes('made up'), 'says it is made up');
  equal(messages(el).length, 4);
  equal(messages(el).map((m) => !m.hidden), [true, false, false, false]);
  equal(messages(el).map((m) => m.dataset.side), ['start', 'end', 'start', 'end']);
  assert(!el.querySelector('[data-lk-from]'), 'the markup messages are replaced');
});

test('conversation: each message names its speaker and move for a screen reader, without repeating them', async () => {
  const el = await mount(CONVERSATION);
  const second = messages(el)[1];
  equal(second.querySelector('.lk-visually-hidden').textContent, 'Message from You. Move: Ask for evidence.');
  equal(second.querySelector('.lk-conversation__who').getAttribute('aria-hidden'), 'true');
  assert(second.querySelector('.lk-conversation__move').textContent.includes('Ask for evidence'), 'the move is written in words');
});

test('conversation: stepping shows one more message, moves focus to it and says where the learner is', async () => {
  const el = await mount(CONVERSATION);
  const seen = listen(el, 'lk-reveal');
  const status = el.querySelector('[role=status]');
  equal(status.textContent, 'Showing 1 of 4 messages.');
  click(find(el, 'Show next message'));
  assert(!messages(el)[1].hidden, 'second message shown');
  assert(document.activeElement === messages(el)[1], 'focus moves to the new message');
  equal(status.textContent, 'Showing 2 of 4 messages.');
  equal(seen, [{ thread: 0, index: 1, remaining: 2 }]);
});

test('conversation: the last message hides the button and lists the moves used, and start again goes back', async () => {
  const el = await mount(CONVERSATION);
  click(find(el, 'Show next message'));
  click(find(el, 'Show next message'));
  click(find(el, 'Show next message'));
  assert(getComputedStyle(find(el, 'Show next message')).display === 'none', 'the button is gone, not just marked hidden');
  equal(el.querySelector('[role=status]').textContent, 'All 4 messages are showing.');
  assert(!el.querySelector('.lk-conversation__moves').hidden, 'the moves are listed');
  assert(el.querySelector('.lk-conversation__moves').textContent.includes('Ask for evidence and Check the source'), 'both moves named');
  click(find(el, 'Start again'));
  equal(el.shown, [1]);
  assert(getComputedStyle(find(el, 'Start again')).display === 'none', 'nothing to start again from the first message');
  assert(el.querySelector('.lk-conversation__moves').hidden, 'the list is hidden again');
});

test('conversation: a note opens on request and closes again on reset', async () => {
  const el = await mount(CONVERSATION);
  click(find(el, 'Show next message'));
  const details = el.querySelector('details');
  equal(details.querySelector('summary').textContent, 'Why this works');
  details.open = true;
  el.reset();
  assert(!details.open, 'reset closes the note');
});

test('conversation: threads sit side by side with their own titles and steps', async () => {
  const el = await mount(`<lk-conversation label="Two ways" stepped>
    <div data-lk-thread="Accepting"><div data-lk-from="A">One</div><div data-lk-from="B">Two</div></div>
    <div data-lk-thread="Questioning"><div data-lk-from="A">One</div><div data-lk-from="B" data-move="Clarify">Two</div></div>
  </lk-conversation>`);
  equal(el.dataset.threads, '2');
  equal([...el.querySelectorAll('h3.lk-conversation__title')].map((h) => h.textContent), ['Accepting', 'Questioning']);
  click(el.querySelectorAll('.lk-conversation__footer .lk-button')[2]);
  equal(el.shown, [1, 2]);
});

test('conversation: without stepped every message shows and the moves are listed straight away', async () => {
  const el = await mount(CONVERSATION.replace(' stepped', ''));
  equal(messages(el).every((m) => !m.hidden), true);
  assert(!find(el, 'Show next message'), 'no step buttons');
  assert(el.querySelector('.lk-conversation__moves').textContent.includes('Questioning moves used'), 'the moves are listed');
});
