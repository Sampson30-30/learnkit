/**
 * Dragging with pointer events, so it works with a mouse, a finger or a pen.
 * (The browser's built-in drag and drop does not work on most touch screens.)
 *
 * Put `touch-action: none` on the handle so a finger drags the item instead of
 * scrolling the page. Anything outside the handle still scrolls normally.
 * Dragging is always an extra: give the item a keyboard and screen reader way
 * to do the same thing.
 *
 *   pointerDrag(handle, item, {
 *     onOver(target)  called as the pointer moves, with the element under it
 *                     (or null when the drag ends)
 *     onDrop(target)  called when the pointer is released after a real drag
 *   })
 *
 * A short press that never moves is not a drag. A floating copy of the item
 * follows the pointer, and `is-dragging` is added to the item while it moves.
 */
export function pointerDrag(handle, item, { onOver, onDrop, threshold = 6 } = {}) {
  handle.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button > 0) return;
    const start = { x: event.clientX, y: event.clientY };
    const box = item.getBoundingClientRect();
    const grab = { x: event.clientX - box.left, y: event.clientY - box.top };
    let ghost = null;
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      /* the pointer is already gone, or this is a synthetic event */
    }

    const under = (x, y) => document.elementFromPoint(x, y);

    const move = (e) => {
      if (!ghost) {
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < threshold) return;
        ghost = item.cloneNode(true);
        ghost.removeAttribute('id');
        ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
        ghost.classList.add('lk-drag-ghost');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.style.width = `${box.width}px`;
        document.body.append(ghost);
        item.classList.add('is-dragging');
      }
      ghost.style.left = `${e.clientX - grab.x}px`;
      ghost.style.top = `${e.clientY - grab.y}px`;
      onOver?.(under(e.clientX, e.clientY));
    };

    const finish = (e, dropped) => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', cancel);
      const dragged = Boolean(ghost);
      ghost?.remove();
      item.classList.remove('is-dragging');
      if (dragged) onOver?.(null);
      if (dragged && dropped) onDrop?.(under(e.clientX, e.clientY));
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    };
    const up = (e) => finish(e, true);
    const cancel = (e) => finish(e, false);

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', cancel);
  });
}
