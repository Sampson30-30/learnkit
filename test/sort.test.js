import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeItem, checkSort, sortMessage, markWord, placeMessage, UNSORTED } from '../src/core/sort.js';

test('placeItem moves an item and returns a new array', () => {
  const start = [UNSORTED, UNSORTED, UNSORTED];
  const next = placeItem(start, 1, 2);
  assert.deepEqual(next, [-1, 2, -1]);
  assert.deepEqual(start, [-1, -1, -1], 'the original is untouched');
});

test('placeItem returns the same array when nothing changes or the item is out of range', () => {
  const start = [0, -1];
  assert.equal(placeItem(start, 0, 0), start);
  assert.equal(placeItem(start, 5, 0), start);
  assert.equal(placeItem(start, -1, 0), start);
});

test('placeItem treats a bad group as the pile', () => {
  assert.deepEqual(placeItem([1, 1], 0, -1), [-1, 1]);
  assert.deepEqual(placeItem([1, 1], 0, undefined), [-1, 1]);
  assert.deepEqual(placeItem([1, 1], 1, 1.5), [1, -1]);
});

test('checkSort marks right, wrong and unsorted items', () => {
  const r = checkSort([0, 1, UNSORTED, 0], [0, 0, 1, 0]);
  assert.deepEqual(r, { marks: ['correct', 'wrong', 'unsorted', 'correct'], score: 2, unsorted: 1, total: 4, complete: false });
  assert.ok(checkSort([1, 0], [1, 0]).complete);
});

test('messages are plain and say what to do', () => {
  assert.match(sortMessage({ score: 3, total: 3, unsorted: 0, complete: true }), /^Correct\. All 3/);
  assert.match(sortMessage({ score: 1, total: 3, unsorted: 1, complete: false }), /1 is not sorted yet\. Move it/);
  assert.match(sortMessage({ score: 1, total: 4, unsorted: 2, complete: false }), /2 are not sorted yet\. Move them/);
  assert.match(sortMessage({ score: 1, total: 3, unsorted: 0, complete: false }), /Move the others/);
  assert.equal(markWord('wrong'), 'Not here');
  assert.equal(markWord('unsorted'), 'Not sorted yet');
  assert.equal(placeMessage('Quiz', 'Formative'), 'Quiz moved to Formative');
  assert.equal(placeMessage('Quiz', null), 'Quiz moved back to the pile');
});
