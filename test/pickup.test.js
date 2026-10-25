import { test } from 'node:test';
import assert from 'node:assert/strict';
import { togglePickup, orderTargets, sortTargets, pickedMessage, putDownMessage } from '../src/core/pickup.js';

test('picking up an item holds it, and picking it up again puts it down', () => {
  assert.equal(togglePickup(null, 2), 2);
  assert.equal(togglePickup(2, 2), null);
});

test('picking up a different item swaps what is in hand', () => {
  assert.equal(togglePickup(2, 0), 0);
});

test('when ordering, an item can go to every position except its own', () => {
  assert.deepEqual(orderTargets(1, 4), [0, 2, 3]);
  assert.deepEqual(orderTargets(0, 2), [1]);
});

test('when sorting, an item can go to the pile or any group except where it is', () => {
  assert.deepEqual(sortTargets(-1, 2), [0, 1], 'from the pile');
  assert.deepEqual(sortTargets(0, 2), [-1, 1], 'from a group');
  assert.deepEqual(sortTargets(1, 3), [-1, 0, 2]);
});

test('the announcements say what happened and what to do next', () => {
  assert.equal(pickedMessage('Plan', 'a position'), 'Plan picked up. Use a Place button to choose a position, or press Pick up again to put it down.');
  assert.equal(putDownMessage('Plan'), 'Plan put down.');
});
