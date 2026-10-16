import { test, assert, equal, mount, click, listen } from './harness.js';

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

test('order: moving an item clears the marks, and dropping reorders', async () => {
  const el = await mount(ORDER);
  click(find(el, 'Check order'));
  const moved = rows(el)[3].querySelector('[data-move=up]');
  click(moved);
  assert(rows(el).every((r) => !r.dataset.state), 'marks cleared');
  const before = [...el.sequence];
  const data = new DataTransfer();
  data.setData('text/plain', '0');
  rows(el)[2].dispatchEvent(new DragEvent('drop', { dataTransfer: data, bubbles: true, cancelable: true }));
  equal(el.sequence, [before[1], before[2], before[0], before[3]]);
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
