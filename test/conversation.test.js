import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeMessages, usableMessages, summariseMoves, nextCount, stepStatus, saysLabel, movesSentence } from '../src/core/conversation.js';

test('the first speaker sits at the start and everyone else at the end', () => {
  const placed = placeMessages([{ from: 'Chatbot' }, { from: 'You' }, { from: 'Chatbot' }, { from: 'Tutor' }]);
  assert.deepEqual(placed.map((m) => m.side), ['start', 'end', 'start', 'end']);
});

test('a side written in the markup is kept, and an unknown one is worked out', () => {
  const placed = placeMessages([{ from: 'A', side: 'end' }, { from: 'B', side: 'sideways' }, { from: 'A' }]);
  assert.deepEqual(placed.map((m) => m.side), ['end', 'end', 'start']);
});

test('placing messages returns new objects and leaves the input alone', () => {
  const input = [{ from: 'A' }];
  const placed = placeMessages(input);
  assert.notEqual(placed[0], input[0]);
  assert.equal(input[0].side, undefined);
});

test('messages without a speaker or without words are dropped', () => {
  const kept = usableMessages([{ from: 'A', text: 'Hi' }, { from: '', text: 'Who?' }, { from: 'B', text: '   ' }, { text: 'Anon' }]);
  assert.deepEqual(kept.map((m) => m.text), ['Hi']);
});

test('moves are counted in the order they first appear, and blank ones are ignored', () => {
  const summary = summariseMoves([{ move: 'Clarify' }, { move: '' }, { move: 'Ask for evidence' }, { move: ' Clarify ' }, {}]);
  assert.deepEqual(summary, [
    { move: 'Clarify', count: 2 },
    { move: 'Ask for evidence', count: 1 },
  ]);
  assert.deepEqual(summariseMoves([{ from: 'A' }]), []);
});

test('showing the next message moves on by one and stops at the end', () => {
  assert.equal(nextCount(1, 4), 2);
  assert.equal(nextCount(4, 4), 4);
  assert.equal(nextCount(0, 0), 0);
});

test('the step status says where the learner is in plain words', () => {
  assert.equal(stepStatus(2, 6), 'Showing 2 of 6 messages.');
  assert.equal(stepStatus(6, 6), 'All 6 messages are showing.');
  assert.equal(stepStatus(1, 1), 'The message is showing.');
  assert.equal(stepStatus(0, 0), '');
});

test('what a screen reader hears names the speaker, and the move when there is one', () => {
  assert.equal(saysLabel('Chatbot'), 'Message from Chatbot.');
  assert.equal(saysLabel('You', 'Ask for evidence'), 'Message from You. Move: Ask for evidence.');
});

test('the moves sentence lists them with counts and reads naturally', () => {
  assert.equal(movesSentence([]), '');
  assert.equal(movesSentence([{ move: 'Clarify', count: 1 }]), 'Questioning moves used: Clarify.');
  assert.equal(
    movesSentence([{ move: 'Clarify', count: 2 }, { move: 'Check the source', count: 1 }, { move: 'Consider alternatives', count: 1 }]),
    'Questioning moves used: Clarify (2), Check the source and Consider alternatives.'
  );
});
