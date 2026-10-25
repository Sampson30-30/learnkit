// The pages a colleague might land on explain themselves in plain English.
// Each has an "About this page" panel with the two parts, and the helper text
// uses none of the words that need a developer's background.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jargonIn, longSentences, textOf, guideIn } from './plain.js';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

const PAGES = ['index.html', 'gallery/index.html', 'customiser/index.html', 'examples/index.html', 'lesson/index.html', 'lesson/architecture/index.html', 'lesson/social-media/index.html'];

for (const file of PAGES) {
  test(`${file} has an "About this page" panel with both parts`, () => {
    const guide = guideIn(read(file));
    assert.ok(guide, 'no <details class="lk-guide"> found');
    assert.match(guide, /<summary>About this page<\/summary>/);
    assert.match(guide, /What this is\./);
    assert.match(guide, /What you can do here/);
    assert.match(guide, /<ul>[\s\S]*<li>/, 'a list of things to do');
  });

  test(`${file} helper text uses no developer jargon and short sentences`, () => {
    const html = read(file);
    const guide = textOf(guideIn(html));
    assert.deepEqual(jargonIn(guide), [], `jargon in the panel: ${jargonIn(guide)}`);
    assert.deepEqual(longSentences(guide), [], 'sentences over 28 words');
  });
}

test('the home page introduction, "what it does" and card descriptions are in plain English', () => {
  const html = read('index.html');
  const lede = textOf(html.match(/<p class="lede">[\s\S]*?<\/p>/)[0]);
  assert.deepEqual(jargonIn(lede), []);
  const does = textOf(html.match(/<ul class="does">[\s\S]*?<\/ul>/)[0]);
  const fallbacks = [...html.matchAll(/<noscript>[\s\S]*?<\/noscript>/g)].map((m) => textOf(m[0]));
  for (const text of fallbacks) assert.deepEqual(jargonIn(text), [], `jargon in a fallback message: "${text}"`);
  assert.deepEqual(jargonIn(does), [], `jargon in "what it does": ${jargonIn(does)}`);
  assert.deepEqual(longSentences(does), []);
  // Everything outside the area for the person who looks after the code.
  const forEveryone = html.slice(0, html.indexOf('class="lk-guide maintainers"'));
  const cards = [...forEveryone.matchAll(/<a class="card"[^>]*>[\s\S]*?<\/a>/g)].map((m) => textOf(m[0]));
  assert.ok(cards.length >= 4, 'the cards for everyone were found');
  for (const text of cards) assert.deepEqual(jargonIn(text), [], `jargon in "${text}"`);
});

test('the library catalogue describes every piece in plain English', async () => {
  const { SHELVES, ALL_PIECES, HERO_SAMPLE } = await import('../home/catalogue.js');
  for (const shelf of SHELVES) {
    for (const text of [shelf.title, shelf.blurb]) assert.deepEqual(jargonIn(text), [], `shelf "${shelf.title}": ${jargonIn(text)}`);
  }
  for (const p of ALL_PIECES) {
    for (const text of [p.name, p.what]) {
      assert.deepEqual(jargonIn(text), [], `${p.id}: jargon in "${text}"`);
      assert.deepEqual(longSentences(text, 25), [], `${p.id}: a sentence is too long`);
    }
  }
  for (const [front, back] of HERO_SAMPLE.cards) assert.deepEqual(jargonIn(`${front} ${back}`), []);
});

test('every piece in the gallery is on exactly one shelf of the library', async () => {
  const { DEMOS } = await import('../gallery/demos.js');
  const { ALL_PIECES, SHELVES } = await import('../home/catalogue.js');
  const ids = ALL_PIECES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'a piece is on two shelves');
  assert.deepEqual([...ids].sort(), DEMOS.map((d) => d.id).sort(), 'the shelves and the gallery list different pieces');
  assert.equal(new Set(ALL_PIECES.map((p) => p.name)).size, ALL_PIECES.length, 'two pieces share a name');
  for (const p of ALL_PIECES) assert.ok(p.tags && p.what && p.name, `${p.id} is incomplete`);
  for (const shelf of SHELVES) assert.ok(shelf.pieces.length >= 3, `${shelf.title} is nearly empty`);
});

test('the customiser and gallery section notes are in plain English', () => {
  for (const file of ['customiser/index.html', 'gallery/index.html']) {
    const notes = [...read(file).matchAll(/<p class="note">([\s\S]*?)<\/p>/g)].map((m) => textOf(m[1]));
    for (const text of notes) assert.deepEqual(jargonIn(text), [], `${file}: jargon in "${text}"`);
  }
});

test('the Rise test explains itself before it asks anything', () => {
  const html = read('rise-test/index.html');
  const intro = textOf(html.slice(html.indexOf('<h1>'), html.indexOf('<h2>What this page found')));
  assert.match(intro, /What this is\./);
  assert.match(intro, /changes nothing in your course/);
  assert.deepEqual(jargonIn(intro.replace(/Rise compatibility test/, '')), []);
});
