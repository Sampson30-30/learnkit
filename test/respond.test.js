import { test } from 'node:test';
import assert from 'node:assert/strict';
import { choose, checkResponses, chosenLead, verdictLead, verdictDetail, unansweredMessage, summaryMessage } from '../src/core/respond.js';

const cases = [{ accepted: ['Challenge'] }, { accepted: ['Report', 'Challenge'] }, { accepted: ['Engage', 'Challenge'] }];

test('choosing records one response and leaves the input alone', () => {
  const start = [null, null, null];
  const next = choose(start, 1, 'Report');
  assert.deepEqual(next, [null, 'Report', null]);
  assert.deepEqual(start, [null, null, null]);
  assert.equal(choose(next, 1, 'Report'), next, 'same choice returns the same array');
  assert.equal(choose(next, 5, 'Report'), next, 'a case that does not exist is ignored');
});

test('a learner can change their mind before checking', () => {
  const first = choose([null], 0, 'Ignore');
  assert.deepEqual(choose(first, 0, 'Challenge'), ['Challenge']);
});

test('checking marks each case, counting any suitable response as correct', () => {
  const result = checkResponses(['Challenge', 'Challenge', 'Ignore'], cases);
  assert.deepEqual(result.marks, ['correct', 'correct', 'wrong']);
  assert.equal(result.score, 2);
  assert.equal(result.complete, false);
});

test('a case with more than one suitable response accepts each of them', () => {
  assert.equal(checkResponses(['Challenge', 'Report', 'Engage'], cases).complete, true);
  assert.equal(checkResponses(['Challenge', 'Challenge', 'Challenge'], cases).complete, true);
});

test('unanswered cases are counted, not marked wrong', () => {
  const result = checkResponses(['Challenge', null, null], cases);
  assert.deepEqual(result.marks, ['correct', 'unanswered', 'unanswered']);
  assert.equal(result.unanswered, 2);
  assert.equal(result.complete, false);
});

test('the words are plain, and the verdict never relies on colour', () => {
  assert.equal(chosenLead('Report'), 'You chose Report.');
  assert.equal(verdictLead('correct'), 'Correct');
  assert.equal(verdictLead('wrong'), 'Not quite');
  assert.equal(verdictDetail('correct', ['Report']), 'This is a suitable response.');
  assert.equal(verdictDetail('wrong', ['Report', 'Challenge']), 'A more suitable choice here: Report or Challenge.');
});

test('the unanswered message agrees with the count', () => {
  assert.match(unansweredMessage(1), /1 remains unanswered/);
  assert.match(unansweredMessage(3), /3 remain unanswered/);
  assert.equal(summaryMessage({ score: 4, total: 5 }), '4 of 5 decisions matched a suitable response. Read the explanation under each one.');
});
