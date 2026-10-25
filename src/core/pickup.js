// Pick up and place, shared by <lk-order> and <lk-sort>.
//
// The learner presses "Pick up" on an item, then presses a "Place" button where
// it should go. No dragging, no holding a button down, and no aiming: every step
// is one click, tap, key press or voice command. The first part of this file is
// DOM-free logic; the last part builds the two buttons so both components look
// and behave the same.

/** Picks an item up, or puts it down if it is already the one in hand. `picked` is null when nothing is held. */
export function togglePickup(picked, item) {
  return picked === item ? null : item;
}

/** Every position an item can be placed at when ordering: all of them except its own. */
export function orderTargets(from, count) {
  return [...Array(count).keys()].filter((position) => position !== from);
}

/** Every place an item can go when sorting: the pile (-1) and each group, except where it already is. */
export function sortTargets(current, groupCount) {
  return [-1, ...Array(groupCount).keys()].filter((group) => group !== current);
}

/** Announced when an item is picked up. `where` is what the learner chooses, such as "a position". */
export function pickedMessage(label, where) {
  return `${label} picked up. Use a Place button to choose ${where}, or press Pick up again to put it down.`;
}

/** Announced when an item is put down without being moved. */
export function putDownMessage(label) {
  return `${label} put down.`;
}

// ---- Buttons ----

/** The "Pick up" button for one item. It is a toggle, and its name says which item. */
export function pickButton(label, pressed, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'lk-button lk-pickup__pick';
  b.dataset.size = 'small';
  b.setAttribute('aria-pressed', String(pressed));
  b.setAttribute('aria-label', `Pick up ${label}`);
  b.textContent = 'Pick up';
  b.addEventListener('click', onClick);
  return b;
}

/** A "Place" button, shown only while something is picked up. */
export function placeButton(text, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'lk-button lk-pickup__place';
  b.dataset.variant = 'primary';
  b.dataset.size = 'small';
  b.textContent = text;
  b.addEventListener('click', onClick);
  return b;
}
