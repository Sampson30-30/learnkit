// DOM-free logic for <lk-glossary>. An entry is { term, definitions }, where
// definitions is a list of strings (one term can have more than one meaning).

/** The letter a term is filed under: its first letter without accents, or # for anything else. */
export function letterOf(term) {
  const first = String(term ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

/** Entries sorted A to Z, ignoring capitals and accents. Returns a new array. */
export function sortEntries(entries) {
  return [...entries].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base', numeric: true }));
}

/** Sorted entries grouped by letter, in order, with # last. */
export function groupByLetter(entries) {
  const groups = new Map();
  for (const entry of sortEntries(entries)) {
    const letter = letterOf(entry.term);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(entry);
  }
  return [...groups.entries()]
    .map(([letter, items]) => ({ letter, entries: items }))
    .sort((a, b) => (a.letter === '#') - (b.letter === '#') || a.letter.localeCompare(b.letter));
}

/** True when every typed word appears in the term or any of its definitions. */
export function matchEntry(entry, query) {
  const words = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [entry.term, ...entry.definitions].join(' ').toLowerCase();
  return words.every((w) => haystack.includes(w));
}

/** The line announced to screen reader users after filtering. */
export function glossarySummary(shown, total) {
  const terms = (n) => `${n} ${n === 1 ? 'term' : 'terms'}`;
  if (total === 0) return 'No terms';
  if (shown === 0) return 'No terms match';
  return shown === total ? terms(total) : `Showing ${shown} of ${terms(total)}`;
}
