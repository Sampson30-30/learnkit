// DOM-free logic for <lk-conversation>. A message is
// { from, side, move, text, html, why, whyLabel }. A thread is { title, messages }.

const SIDES = ['start', 'end'];

/**
 * Gives every message a side. A side written in the markup is kept. Otherwise
 * the first speaker sits at the start and everyone else at the end, so a
 * two-person conversation reads like a chat. Returns a new array.
 */
export function placeMessages(messages) {
  const first = messages.find((m) => m.from)?.from;
  return messages.map((m) => ({ ...m, side: SIDES.includes(m.side) ? m.side : m.from === first ? 'start' : 'end' }));
}

/** Messages that have a speaker and something to say. The rest are dropped. */
export function usableMessages(messages) {
  return messages.filter((m) => String(m.from ?? '').trim() && String(m.text ?? '').trim());
}

/** The questioning moves used, in the order they first appear, with how often. */
export function summariseMoves(messages) {
  const counts = new Map();
  for (const m of messages) {
    const move = String(m.move ?? '').trim();
    if (move) counts.set(move, (counts.get(move) ?? 0) + 1);
  }
  return [...counts.entries()].map(([move, count]) => ({ move, count }));
}

/** The next number of messages to show: one more, never past the end. */
export function nextCount(shown, total) {
  return Math.min(total, shown + 1);
}

/** Plain words for how far through a conversation the learner is. */
export function stepStatus(shown, total) {
  if (total === 0) return '';
  if (shown >= total) return total === 1 ? 'The message is showing.' : `All ${total} messages are showing.`;
  return `Showing ${shown} of ${total} messages.`;
}

/** The words a screen reader hears before a message, so it never depends on position or colour. */
export function saysLabel(from, move) {
  return move ? `Message from ${from}. Move: ${move}.` : `Message from ${from}.`;
}

/** A sentence naming the moves used, for the summary under a finished thread. */
export function movesSentence(summary) {
  if (!summary.length) return '';
  const parts = summary.map(({ move, count }) => (count > 1 ? `${move} (${count})` : move));
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
  return `Questioning moves used: ${list}.`;
}
