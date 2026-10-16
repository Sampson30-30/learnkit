import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normaliseAnswer, acceptedAnswers, textMatches, expectsTick, markSlot, checkMatrix, matrixMessage, markWord, answerText } from '../src/core/matrix.js';

test('normaliseAnswer ignores capitals, spare spaces and edge punctuation', () => {
  assert.equal(normaliseAnswer('  Social   Learning. '), 'social learning');
  assert.equal(normaliseAnswer('“Habits”'.replace(/[“”]/g, '"')), 'habits');
  assert.equal(normaliseAnswer(null), '');
});

test('acceptedAnswers splits on a vertical bar', () => {
  assert.deepEqual(acceptedAnswers('Habits | Behaviour'), ['Habits', 'Behaviour']);
  assert.deepEqual(acceptedAnswers(''), []);
});

test('textMatches accepts any listed answer and rejects empty input', () => {
  assert.ok(textMatches('behaviour', 'Habits|Behaviour'));
  assert.ok(!textMatches('', 'Habits'));
  assert.ok(!textMatches('habit', 'Habits'));
});

test('expectsTick reads yes, empty and no', () => {
  assert.equal(expectsTick('yes'), true);
  assert.equal(expectsTick(''), true);
  assert.equal(expectsTick('No'), false);
});

test('markSlot marks text and tick slots', () => {
  assert.equal(markSlot({ kind: 'text', answer: 'a' }, 'A'), 'correct');
  assert.equal(markSlot({ kind: 'text', answer: 'a' }, 'b'), 'wrong');
  assert.equal(markSlot({ kind: 'text', answer: 'a' }, '  '), 'blank');
  assert.equal(markSlot({ kind: 'tick', answer: false }, false), 'correct');
  assert.equal(markSlot({ kind: 'tick', answer: true }, false), 'wrong');
});

test('checkMatrix scores and reports completion', () => {
  const slots = [{ kind: 'text', answer: 'x' }, { kind: 'tick', answer: true }, { kind: 'text', answer: 'y' }];
  const r = checkMatrix(slots, ['x', false, '']);
  assert.deepEqual(r, { marks: ['correct', 'wrong', 'blank'], score: 1, blank: 1, total: 3, complete: false });
  assert.ok(checkMatrix(slots, ['X', true, 'y']).complete);
});

test('messages and words are plain', () => {
  assert.match(matrixMessage({ score: 3, total: 3, blank: 0, complete: true }), /^Correct/);
  assert.match(matrixMessage({ score: 1, total: 3, blank: 1, complete: false }), /1 is still empty/);
  assert.match(matrixMessage({ score: 1, total: 3, blank: 2, complete: false }), /2 are still empty/);
  assert.equal(markWord('wrong'), 'Not quite');
  assert.equal(answerText({ kind: 'text', answer: 'a|b' }), 'a');
  assert.equal(answerText({ kind: 'tick', answer: false }), 'Not ticked');
});
