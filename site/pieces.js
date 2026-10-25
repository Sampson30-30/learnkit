// DOM-free logic for the index on the Examples page.
//
// `sections` are the example sections on the page: { id, heading, shelf }.
// `shelves` and `pieces` come from home/catalogue.js, so the index groups pieces
// the same way the home page does and uses the same plain names.

const MORE = { id: 'more', title: 'More' };

/** The words shown for a section: the catalogue's plain name when it is a single piece, otherwise its heading. */
export function labelFor(section, pieces) {
  return pieces.find((piece) => piece.id === section.id)?.name ?? section.heading;
}

/** Groups sections by shelf, in shelf order. A section with no known shelf goes under "More". Empty shelves are left out.
 *  Inside a shelf, pieces keep the catalogue's order; sections that cover several pieces follow, in page order. */
export function groupSections(sections, shelves, pieces) {
  const groups = [...shelves, MORE].map((shelf) => ({ id: shelf.id, title: shelf.title, items: [] }));
  for (const section of sections) {
    const group = groups.find((g) => g.id === section.shelf) ?? groups.at(-1);
    const piece = pieces.find((p) => p.id === section.id);
    group.items.push({
      id: section.id,
      label: labelFor(section, pieces),
      keywords: [section.heading, section.id, piece?.tags ?? '', piece?.what ?? ''].join(' '),
    });
  }
  const rank = (item) => {
    const at = pieces.findIndex((piece) => piece.id === item.id);
    return at < 0 ? Infinity : at;
  };
  for (const group of groups) group.items.sort((a, b) => (rank(a) === rank(b) ? 0 : rank(a) < rank(b) ? -1 : 1));
  return groups.filter((g) => g.items.length);
}

/** Keeps the items that contain every word typed, ignoring capitals. Groups left empty are dropped. */
export function filterGroups(groups, query) {
  const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const text = `${item.label} ${item.keywords}`.toLowerCase();
        return words.every((word) => text.includes(word));
      }),
    }))
    .filter((group) => group.items.length);
}

/** How many items there are across all groups. */
export function countItems(groups) {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

/** The line announced under the search box. */
export function filterMessage(shown, total, query) {
  const typed = String(query).trim();
  if (!typed) return `${total} pieces`;
  if (shown === 0) return `No pieces match “${typed}”.`;
  return `Showing ${shown} of ${total}.`;
}

/** The piece being read: the last one whose top has reached `line`, or the first piece when none has. `tops` is in page order. */
export function activeSection(tops, line) {
  let active = tops[0]?.id ?? null;
  for (const { id, top } of tops) {
    if (top <= line) active = id;
    else break;
  }
  return active;
}
