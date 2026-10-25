// The manifest and llms.txt are generated from the doc comments in src/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read, generate } from '../scripts/manifest.mjs';

const elements = read().flatMap((m) => m.declarations);

test('custom-elements.json and llms.txt are up to date (run npm run manifest)', () => {
  assert.deepEqual(generate({ check: true }), []);
});

test('every element is documented with a description and an accessible-name or content rule', () => {
  const bare = elements.filter((e) => !e.description.startsWith(`<${e.tagName}>`)).map((e) => e.tagName);
  assert.deepEqual(bare, [], 'add a doc comment starting with <tag-name> above the class');
});

// These have no example in their doc comment yet. Add one, then remove the name here.
const WITHOUT_EXAMPLE = ['lk-accordion', 'lk-field', 'lk-choices', 'lk-modal', 'lk-progress', 'lk-tabs'];

test('every element has an example in its doc comment', () => {
  const missing = elements.filter((e) => !e.examples.length).map((e) => e.tagName);
  assert.deepEqual(missing, WITHOUT_EXAMPLE);
});

test('every event named in a doc comment has a name that starts lk-', () => {
  for (const e of elements) for (const ev of e.events) assert.match(ev.name, /^lk-/, e.tagName);
});
