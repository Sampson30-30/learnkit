import { toast } from '../src/index.js';
import { THEMES, DEMOS } from './demos.js';

const stage = document.getElementById('stage');
const componentSelect = document.getElementById('component');
const themeSelect = document.getElementById('theme');
const componentField = document.getElementById('component-field');
const themeField = document.getElementById('theme-field');
let counter = 0;

for (const d of DEMOS) componentSelect.append(new Option(d.title, d.id));
for (const t of THEMES) themeSelect.append(new Option(t.name, t.id));

const state = { view: 'compare', component: DEMOS[0].id, theme: 'clean', mode: '' };

/** Reads and writes the page state in the URL hash, so a view can be shared. */
function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (['compare', 'theme'].includes(params.get('view'))) state.view = params.get('view');
  if (DEMOS.some((d) => d.id === params.get('component'))) state.component = params.get('component');
  if (THEMES.some((t) => t.id === params.get('theme'))) state.theme = params.get('theme');
  if (['light', 'dark'].includes(params.get('mode'))) state.mode = params.get('mode');
}

function writeHash() {
  const params = new URLSearchParams({ view: state.view, component: state.component, theme: state.theme });
  if (state.mode) params.set('mode', state.mode);
  history.replaceState(null, '', `#${params}`);
}

function pane(theme, demos, { heading }) {
  const el = document.createElement('section');
  el.className = 'pane';
  el.dataset.lkTheme = theme.id || 'default';
  if (state.mode) el.dataset.lkMode = state.mode;
  el.setAttribute('aria-label', `${theme.name} theme`);
  const head = document.createElement('div');
  head.className = 'pane-head';
  head.innerHTML = `<h2></h2><p></p>`;
  head.querySelector('h2').textContent = heading;
  head.querySelector('p').textContent = theme.note;
  el.append(head);
  for (const demo of demos) {
    counter += 1;
    const wrap = document.createElement('div');
    wrap.className = 'demo';
    if (demos.length > 1) {
      const t = document.createElement('p');
      t.className = 'demo-title';
      t.textContent = demo.title;
      wrap.append(t);
    }
    const body = document.createElement('div');
    body.innerHTML = demo.html(counter);
    wrap.append(body);
    el.append(wrap);
  }
  return el;
}

function render() {
  stage.replaceChildren();
  componentField.hidden = state.view !== 'compare';
  themeField.hidden = state.view !== 'theme';
  stage.className = state.view === 'compare' ? 'compare' : 'single';
  if (state.view === 'compare') {
    const demo = DEMOS.find((d) => d.id === state.component);
    for (const theme of THEMES) stage.append(pane(theme, [demo], { heading: theme.name }));
  } else {
    const theme = THEMES.find((t) => t.id === state.theme);
    stage.append(pane(theme, DEMOS, { heading: `${theme.name} theme` }));
  }
  componentSelect.value = state.component;
  themeSelect.value = state.theme;
  document.querySelector(`input[name=view][value=${state.view}]`).checked = true;
  document.querySelector(`input[name=mode][value="${state.mode}"]`).checked = true;
  writeHash();
}

document.querySelectorAll('input[name=view]').forEach((r) => r.addEventListener('change', () => { state.view = r.value; render(); }));
document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', () => { state.mode = r.value; render(); }));
componentSelect.addEventListener('change', () => { state.component = componentSelect.value; render(); });
themeSelect.addEventListener('change', () => { state.theme = themeSelect.value; render(); });

// Toast buttons: show the toast in the theme and mode of the pane that was used.
stage.addEventListener('click', (event) => {
  const button = event.target.closest('[data-gallery-toast]');
  if (!button) return;
  const owner = button.closest('.pane');
  let region = document.querySelector('lk-toasts');
  if (!region) {
    region = document.createElement('lk-toasts');
    document.body.append(region);
  }
  for (const [attr, value] of [['data-lk-theme', owner.dataset.lkTheme], ['data-lk-mode', owner.dataset.lkMode]]) {
    if (value) region.setAttribute(attr, value);
    else region.removeAttribute(attr);
  }
  const tone = button.dataset.galleryToast;
  if (tone === 'success') toast('Progress saved', { tone });
  else if (tone === 'warning') toast('Course deleted', { tone, action: { label: 'Undo', onClick: () => {} } });
  else toast('We could not save your changes. Check your connection and try again.', { tone });
});

window.addEventListener('hashchange', () => { readHash(); render(); });
readHash();
render();
