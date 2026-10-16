// DOM-free logic for <lk-matrix>. A matrix is a list of "slots", one per
// answerable cell. A text slot is { kind: 'text', answer: 'a|b' } and a tick
// slot is { kind: 'tick', answer: true | false }.

/** Lower case, trimmed, with inner spacing and surrounding punctuation removed. */
export function normaliseAnswer(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'.,;:!?()-]+|[\s"'.,;:!?()-]+$/g, '');
}

/** Every answer accepted for a text cell. Separate alternatives with a vertical bar. */
export function acceptedAnswers(answer) {
  return String(answer ?? '')
    .split('|')
    .map((a) => a.trim())
    .filter(Boolean);
}

/** True when a typed value matches any accepted answer. */
export function textMatches(value, answer) {
  const typed = normaliseAnswer(value);
  if (!typed) return false;
  return acceptedAnswers(answer).some((a) => normaliseAnswer(a) === typed);
}

/** Reads a tick cell's data-tick value: "yes" (or empty) means it should be ticked, "no" means not. */
export function expectsTick(value) {
  return String(value ?? '').trim().toLowerCase() !== 'no';
}

/** Marks one slot as 'correct', 'wrong' or 'blank' (a text cell left empty). */
export function markSlot(slot, value) {
  if (slot.kind === 'tick') return Boolean(value) === slot.answer ? 'correct' : 'wrong';
  if (!normaliseAnswer(value)) return 'blank';
  return textMatches(value, slot.answer) ? 'correct' : 'wrong';
}

/** Marks every slot. `values` holds what the learner entered, in the same order as `slots`. */
export function checkMatrix(slots, values) {
  const marks = slots.map((slot, i) => markSlot(slot, values[i]));
  const score = marks.filter((m) => m === 'correct').length;
  const blank = marks.filter((m) => m === 'blank').length;
  return { marks, score, blank, total: slots.length, complete: score === slots.length };
}

/** The sentence shown after checking. */
export function matrixMessage({ score, total, blank, complete }) {
  if (complete) return `Correct. All ${total} answers are right.`;
  const base = `${score} of ${total} right.`;
  return blank > 0
    ? `${base} ${blank} ${blank === 1 ? 'is' : 'are'} still empty. Fill them in and check again.`
    : `${base} Change the others and check again.`;
}

/** The word shown beside a marked cell, so colour is never the only signal. */
export function markWord(mark) {
  return { correct: 'Right', wrong: 'Not quite', blank: 'Empty' }[mark] ?? '';
}

/** The answer to show a learner who asks to see it: the first accepted text, or yes/no for a tick. */
export function answerText(slot) {
  if (slot.kind === 'tick') return slot.answer ? 'Ticked' : 'Not ticked';
  return acceptedAnswers(slot.answer)[0] ?? '';
}
