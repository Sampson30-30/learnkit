import { test } from 'node:test';
import assert from 'node:assert/strict';
import { letterOf, sortEntries, groupByLetter, matchEntry, glossarySummary } from '../src/core/glossary.js';

const e = (term, ...definitions) => ({ term, definitions });

test('letterOf ignores accents and files non-letters under #', () => {
  assert.equal(letterOf('  apple'), 'A');
  assert.equal(letterOf('Élan'), 'E');
  assert.equal(letterOf('3D printing'), '#');
  assert.equal(letterOf(''), '#');
});

test('sortEntries sorts A to Z without changing the original', () => {
  const list = [e('banana', 'x'), e('Apple', 'x'), e('cherry', 'x')];
  assert.deepEqual(sortEntries(list).map((x) => x.term), ['Apple', 'banana', 'cherry']);
  assert.equal(list[0].term, 'banana');
});

test('groupByLetter groups in order with # last', () => {
  const groups = groupByLetter([e('Zeta', 'x'), e('4G', 'x'), e('alpha', 'x'), e('Apex', 'x')]);
  assert.deepEqual(groups.map((g) => g.letter), ['A', 'Z', '#']);
  assert.deepEqual(groups[0].entries.map((x) => x.term), ['alpha', 'Apex']);
});

test('matchEntry needs every word, in the term or a meaning', () => {
  const entry = e('Feedback', 'Comments that help a learner improve', 'A reply');
  assert.ok(matchEntry(entry, ''));
  assert.ok(matchEntry(entry, 'feed improve'));
  assert.ok(matchEntry(entry, 'reply'));
  assert.ok(!matchEntry(entry, 'feed grade'));
});

test('glossarySummary words the count', () => {
  assert.equal(glossarySummary(0, 0), 'No terms');
  assert.equal(glossarySummary(0, 5), 'No terms match');
  assert.equal(glossarySummary(1, 1), '1 term');
  assert.equal(glossarySummary(5, 5), '5 terms');
  assert.equal(glossarySummary(2, 5), 'Showing 2 of 5 terms');
});
