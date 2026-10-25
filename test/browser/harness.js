// A tiny in-browser test runner. No dependencies.
// Open /test/browser/ (npm start) and read the page, or read window.__results.

const tests = [];

export function test(name, fn) {
  tests.push({ name, fn });
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

export function equal(actual, expected, message = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message} Expected ${e}, got ${a}`.trim());
}

const stage = document.createElement('div');
stage.id = 'stage';

/** Mounts HTML into the stage and waits for LearnKit elements to be ready. */
export async function mount(html) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  stage.append(wrapper);
  await tick();
  return wrapper.firstElementChild;
}

export function tick(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Waits until fn() is truthy, checking every 10ms, for up to `ms`. */
export async function waitFor(fn, ms = 1000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return true;
    await tick(10);
  }
  return Boolean(fn());
}

export function click(el) {
  el.click();
}

export function press(el, key, init = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
}

/**
 * Jumps every running animation under `el` to its end. Animations take real
 * time, and a page that is not being drawn steadily (a background tab, a
 * hidden pane) can take many times longer than the animation says. Tests that
 * measure where something ends up call this instead of waiting for the clock.
 */
export function settle(el) {
  for (const animation of el.getAnimations({ subtree: true })) animation.finish();
}

/** Drags from a handle to a point with pointer events, as a finger or mouse would. */
export async function dragBetween(handle, to, id = 7) {
  const from = handle.getBoundingClientRect();
  const x = from.left + from.width / 2;
  const y = from.top + from.height / 2;
  const fire = (target, type, at) =>
    target.dispatchEvent(new PointerEvent(type, { pointerId: id, isPrimary: true, button: 0, clientX: at.x, clientY: at.y, bubbles: true, cancelable: true }));
  fire(handle, 'pointerdown', { x, y });
  fire(handle, 'pointermove', { x: (x + to.x) / 2, y: (y + to.y) / 2 });
  fire(handle, 'pointermove', to);
  fire(handle, 'pointerup', to);
  await tick();
}

/** Records events of one type fired on or below `target`. */
export function listen(target, type) {
  const seen = [];
  target.addEventListener(type, (e) => seen.push(e.detail));
  return seen;
}

export async function run() {
  document.body.append(stage);
  const results = { passed: 0, failed: 0, failures: [] };
  const list = document.createElement('ul');
  list.id = 'results';
  for (const { name, fn } of tests) {
    const li = document.createElement('li');
    try {
      await fn();
      results.passed += 1;
      li.textContent = `PASS ${name}`;
    } catch (error) {
      results.failed += 1;
      results.failures.push(`${name}: ${error.message}`);
      li.textContent = `FAIL ${name}: ${error.message}`;
      li.style.color = 'crimson';
    }
    list.append(li);
    stage.replaceChildren();
  }
  const summary = document.createElement('h1');
  summary.id = 'summary';
  summary.textContent = `${results.passed} passed, ${results.failed} failed`;
  document.body.prepend(summary);
  summary.after(list);
  window.__results = results;
  document.title = summary.textContent;
}
