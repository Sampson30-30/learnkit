// DOM-free logic for <lk-sort>. `placements[i]` is the group item i is in, or
// -1 while it is still in the pile. `answers[i]` is the group it belongs in.

export const UNSORTED = -1;

/** Puts an item in a group (or back in the pile with -1). Returns a new array. */
export function placeItem(placements, item, group) {
  if (item < 0 || item >= placements.length) return placements;
  const target = Number.isInteger(group) && group >= 0 ? group : UNSORTED;
  if (placements[item] === target) return placements;
  const out = [...placements];
  out[item] = target;
  return out;
}

/** Marks each item 'correct', 'wrong' or 'unsorted'. */
export function checkSort(placements, answers) {
  const marks = placements.map((group, i) => (group === UNSORTED ? 'unsorted' : group === answers[i] ? 'correct' : 'wrong'));
  const score = marks.filter((m) => m === 'correct').length;
  const unsorted = marks.filter((m) => m === 'unsorted').length;
  return { marks, score, unsorted, total: placements.length, complete: score === placements.length };
}

/** The sentence shown after checking. */
export function sortMessage({ score, total, unsorted, complete }) {
  if (complete) return `Correct. All ${total} are in the right group.`;
  const base = `${score} of ${total} in the right group.`;
  return unsorted > 0
    ? `${base} ${unsorted} ${unsorted === 1 ? 'is' : 'are'} not sorted yet. Move ${unsorted === 1 ? 'it' : 'them'} into a group and check again.`
    : `${base} Move the others and check again.`;
}

/** The word shown beside a marked item, so colour is never the only signal. */
export function markWord(mark) {
  return { correct: 'Right group', wrong: 'Not here', unsorted: 'Not sorted yet' }[mark] ?? '';
}

/** The sentence announced after a move. `groupName` is null for the pile. */
export function placeMessage(label, groupName) {
  return groupName ? `${label} moved to ${groupName}` : `${label} moved back to the pile`;
}
