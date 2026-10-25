import '../src/index.js';
import { THEMES, DEMOS } from '../gallery/demos.js';
import { checkTokens, toHex6 } from '../src/core/contrast.js';
import { buildOverrideCss, TOKEN_ORDER } from '../src/core/customise.js';

const PREVIEW_DEMOS = ['lk-tabs', 'buttons', 'lk-field', 'lk-accordion', 'lk-progress', 'lk-quiz', 'lk-rating', 'lk-modal'];
const STORAGE_KEY = 'lk-customiser';

const COLOURS = [
  ['color-page', 'Page'],
  ['color-bg', 'Component background'],
  ['color-surface', 'Raised surface'],
  ['color-text', 'Text'],
  ['color-muted', 'Muted text'],
  ['color-border', 'Border'],
  ['color-divider', 'Divider'],
  ['color-primary', 'Accent'],
  ['color-primary-text', 'Text on accent'],
  ['color-focus', 'Focus ring'],
  ['color-success', 'Success'],
  ['color-success-bg', 'Success tint'],
  ['color-warning', 'Warning'],
  ['color-warning-bg', 'Warning tint'],
  ['color-danger', 'Error'],
  ['color-danger-bg', 'Error tint'],
  ['color-info', 'Info'],
  ['color-info-bg', 'Info tint'],
  ['color-backdrop', 'Modal backdrop'],
];

const FONTS = [
  ['System', "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"],
  ['Rounded', "ui-rounded, 'SF Pro Rounded', 'Nunito', 'Segoe UI', system-ui, sans-serif"],
  ['Verdana', "Verdana, Geneva, 'DejaVu Sans', sans-serif"],
  ['Georgia (serif)', "Georgia, 'Times New Roman', Times, serif"],
  ['Heavy sans', "'Arial Black', 'Helvetica Neue', Arial, sans-serif"],
  ['Monospace', "ui-monospace, 'SF Mono', Menlo, Consolas, monospace"],
];

const SHADOWS = [
  ['None', 'none'],
  ['Soft', '0 1px 2px rgb(16 24 40 / 6%), 0 8px 24px rgb(16 24 40 / 10%)'],
  ['Hard offset', '4px 4px 0 0 var(--lk-color-text)'],
];

const $ = (id) => document.getElementById(id);
const preview = $('preview');
let counter = 0;

const state = { base: 'clean', editing: 'light', edits: { light: {}, dark: {}, shared: {} } };
let baseTokens = { light: {}, dark: {} };

// ---- Storage ----

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && THEMES.some((t) => t.id === saved.base)) {
      state.base = saved.base;
      for (const k of ['light', 'dark', 'shared']) state.edits[k] = { ...(saved.edits?.[k] || {}) };
    }
  } catch { /* nothing saved, or storage blocked */ }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ base: state.base, edits: state.edits })); } catch { /* storage blocked */ }
}

// ---- Reading a theme's real values ----

function readTokens(base, mode) {
  const probe = document.createElement('div');
  probe.dataset.lkTheme = base || 'default';
  probe.dataset.lkMode = mode;
  probe.hidden = true;
  document.body.append(probe);
  const styles = getComputedStyle(probe);
  const out = {};
  for (const name of TOKEN_ORDER) out[name] = styles.getPropertyValue(`--lk-${name}`).trim();
  probe.remove();
  return out;
}

function effective(mode) {
  return { ...baseTokens[mode], ...state.edits.shared, ...state.edits[mode] };
}

// ---- Editing ----

function setEdit(name, value, scope) {
  const bag = state.edits[scope];
  const base = scope === 'shared' ? baseTokens[state.editing][name] : baseTokens[scope][name];
  if (value === '' || value === base) delete bag[name];
  else bag[name] = value;
  refresh();
}

function isChanged(name) {
  return name in state.edits[state.editing] || name in state.edits.shared;
}

function colourRow([name, label]) {
  const row = document.createElement('div');
  row.className = 'token-row';
  row.dataset.token = name;
  const id = `c-${name}`;
  const lab = document.createElement('label');
  lab.htmlFor = `${id}-hex`;
  lab.textContent = label;
  const hex = document.createElement('input');
  hex.type = 'text';
  hex.id = `${id}-hex`;
  hex.spellcheck = false;
  hex.autocomplete = 'off';
  hex.addEventListener('change', () => {
    const v = hex.value.trim();
    if (name === 'color-backdrop') setEdit(name, v, state.editing);
    else if (toHex6(v)) setEdit(name, toHex6(v), state.editing);
    else refresh();
  });
  if (name === 'color-backdrop') {
    row.classList.add('text-only');
    row.append(lab, hex);
    return row;
  }
  const picker = document.createElement('input');
  picker.type = 'color';
  picker.id = `${id}-picker`;
  picker.setAttribute('aria-label', `${label} colour picker`);
  picker.addEventListener('input', () => setEdit(name, picker.value, state.editing));
  row.append(lab, picker, hex);
  return row;
}

function rangeRow({ id, label, min, max, step, unit, token, pill }) {
  const wrap = document.createElement('div');
  wrap.className = 'range-row';
  const head = document.createElement('div');
  head.className = 'range-head';
  const lab = document.createElement('label');
  lab.htmlFor = id;
  lab.textContent = label;
  const out = document.createElement('output');
  out.htmlFor = id;
  head.append(lab, out);
  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = min;
  input.max = max;
  input.step = step;
  input.addEventListener('input', () => setEdit(token, `${input.value}${unit}`, 'shared'));
  wrap.append(head, input);
  const parts = { input, out, token, unit };
  if (pill) {
    const check = document.createElement('label');
    check.className = 'inline-check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.id = `${id}-pill`;
    box.addEventListener('change', () => setEdit(token, box.checked ? '999px' : `${input.value}${unit}`, 'shared'));
    check.append(box, 'Fully rounded');
    wrap.append(check);
    parts.box = box;
  }
  return { wrap, parts };
}

function selectRow({ id, label, token, options, themeDefault = 'Theme default' }) {
  const wrap = document.createElement('label');
  wrap.className = 'field';
  const span = document.createElement('span');
  span.textContent = label;
  const select = document.createElement('select');
  select.id = id;
  select.append(new Option(themeDefault, ''));
  for (const [text, value] of options) select.append(new Option(text, value));
  select.addEventListener('change', () => setEdit(token, select.value, 'shared'));
  wrap.append(span, select);
  return { wrap, select, token };
}

const controls = { colours: {}, ranges: [], selects: [] };

function buildControls() {
  const colours = $('colours');
  for (const c of COLOURS) {
    const row = colourRow(c);
    colours.append(row);
    controls.colours[c[0]] = row;
  }
  const shape = $('shape');
  for (const spec of [
    { id: 'r-radius', label: 'Corner radius (containers)', min: 0, max: 40, step: 1, unit: 'px', token: 'radius' },
    { id: 'r-control', label: 'Corner radius (controls)', min: 0, max: 24, step: 1, unit: 'px', token: 'radius-control', pill: true },
    { id: 'r-border', label: 'Border width', min: 0, max: 6, step: 1, unit: 'px', token: 'border-width' },
    { id: 'r-space', label: 'Spacing', min: 0.75, max: 2, step: 0.05, unit: 'rem', token: 'space' },
  ]) {
    const { wrap, parts } = rangeRow(spec);
    shape.append(wrap);
    controls.ranges.push(parts);
  }
  const shadow = selectRow({ id: 's-shadow', label: 'Shadow', token: 'shadow', options: SHADOWS });
  shape.append(shadow.wrap);
  controls.selects.push(shadow);
  const fonts = $('fonts');
  const body = selectRow({ id: 'f-body', label: 'Body font', token: 'font', options: FONTS });
  const heading = selectRow({ id: 'f-heading', label: 'Heading font', token: 'font-heading', options: [['Same as body', 'var(--lk-font)'], ...FONTS] });
  fonts.append(body.wrap, heading.wrap);
  controls.selects.push(body, heading);
}

// ---- Rendering ----

function syncControls() {
  const values = effective(state.editing);
  for (const [name] of COLOURS) {
    const row = controls.colours[name];
    const hex = row.querySelector('input[type=text]');
    hex.value = values[name] || '';
    const picker = row.querySelector('input[type=color]');
    if (picker) {
      const six = toHex6(values[name]);
      picker.value = six || '#000000';
      picker.disabled = !six;
    }
    row.classList.toggle('is-changed', isChanged(name));
  }
  for (const { input, out, token, unit, box } of controls.ranges) {
    const raw = values[token];
    const pill = raw === '999px';
    const n = parseFloat(raw);
    input.value = Number.isFinite(n) && !pill ? n : input.max;
    input.disabled = pill;
    if (box) box.checked = pill;
    out.textContent = pill ? 'fully rounded' : `${input.value}${unit}`;
  }
  for (const { select, token } of controls.selects) {
    const edited = state.edits.shared[token];
    select.value = [...select.options].some((o) => o.value === edited) ? edited : '';
  }
}

function applyPreview() {
  preview.dataset.lkTheme = state.base || 'default';
  preview.dataset.lkMode = state.editing;
  for (const name of TOKEN_ORDER) preview.style.removeProperty(`--lk-${name}`);
  for (const [name, value] of Object.entries({ ...state.edits.shared, ...state.edits[state.editing] })) {
    preview.style.setProperty(`--lk-${name}`, value);
  }
}

function renderChecks() {
  const strictText = state.base === 'contrast' ? 7 : 4.5;
  const summary = [];
  for (const mode of ['light', 'dark']) {
    const results = checkTokens(effective(mode), { strictText });
    const failing = results.filter((r) => !r.pass).length;
    summary.push(`${mode === 'light' ? 'Light' : 'Dark'}: ${failing === 0 ? `all ${results.length} checks pass` : `${failing} of ${results.length} checks fail`}`);
  }
  $('check-summary').textContent = summary.join('. ') + '.';
  // A copy beside the preview, so contrast is visible while you edit. It is hidden from
  // screen readers because the live summary under the preview already announces it.
  $('preview-summary').textContent = $('check-summary').textContent;
  const tbody = $('check-table').querySelector('tbody');
  tbody.replaceChildren();
  for (const r of checkTokens(effective(state.editing), { strictText })) {
    const tr = document.createElement('tr');
    tr.className = r.pass ? 'pass' : 'fail';
    for (const [text, cls] of [[r.label, ''], [`${r.ratio.toFixed(2)}:1`, ''], [`${r.min}:1`, ''], [r.pass ? 'Pass' : 'Fail', 'result']]) {
      const td = document.createElement('td');
      td.textContent = text;
      if (cls) td.className = cls;
      tr.append(td);
    }
    tbody.append(tr);
  }
}

function renderExport() {
  $('css').value = buildOverrideCss({ base: state.base, light: state.edits.light, dark: state.edits.dark, shared: state.edits.shared });
}

function refresh() {
  syncControls();
  applyPreview();
  renderChecks();
  renderExport();
  save();
}

function renderPreview() {
  preview.replaceChildren();
  for (const id of PREVIEW_DEMOS) {
    const demo = DEMOS.find((d) => d.id === id);
    counter += 1;
    const wrap = document.createElement('div');
    wrap.className = 'demo';
    const title = document.createElement('p');
    title.className = 'demo-title';
    title.textContent = demo.title;
    const body = document.createElement('div');
    body.innerHTML = demo.html(`cz${counter}`);
    wrap.append(title, body);
    preview.append(wrap);
  }
}

function startFrom(base, { keepEdits = false } = {}) {
  state.base = base;
  if (!keepEdits) state.edits = { light: {}, dark: {}, shared: {} };
  baseTokens = { light: readTokens(base, 'light'), dark: readTokens(base, 'dark') };
  $('base').value = base;
  refresh();
}

// ---- Wiring ----

for (const t of THEMES) $('base').append(new Option(t.name, t.id));
buildControls();
load();
renderPreview();
startFrom(state.base, { keepEdits: true });

$('base').addEventListener('change', () => {
  startFrom($('base').value);
  $('export-status').textContent = `Started again from ${THEMES.find((t) => t.id === state.base).name}.`;
});

document.querySelectorAll('input[name=editing]').forEach((r) => r.addEventListener('change', () => {
  state.editing = r.value;
  refresh();
}));

$('reset').addEventListener('click', () => {
  state.edits = { light: {}, dark: {}, shared: {} };
  refresh();
  $('export-status').textContent = 'All changes removed.';
});

$('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('css').value);
    $('export-status').textContent = 'Copied to the clipboard.';
  } catch {
    $('css').select();
    $('export-status').textContent = 'Press Ctrl+C or Cmd+C to copy the selected CSS.';
  }
});

$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([$('css').value], { type: 'text/css;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'customisation.css';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('export-status').textContent = 'Downloaded customisation.css.';
});
