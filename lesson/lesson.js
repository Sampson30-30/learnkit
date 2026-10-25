// Behaviour shared by the sample lessons: the look switcher and the progress bar.
//
// A lesson needs, in its page:
//   <link id="theme-sheet" ...>               the current theme's stylesheet
//   <div data-lesson-controls>                where the Look and Mode choices are built
//   <lk-progress id="progress" value="0">     the bar
//   <body data-activities="5">                how many activities count towards it
import { toast } from '../src/index.js';

const LOOKS = [['clean', 'Clean'], ['soft', 'Soft'], ['bold', 'Bold'], ['contrast', 'High contrast'], ['homepage', 'Homepage'], ['blc', 'BLC'], ['howdigital', 'HoW Digital'], ['sankofa', 'Sankofa']];
const MODES = [['', 'Match my device'], ['light', 'Light'], ['dark', 'Dark']];

/** A labelled choice list. `onChange` gets the chosen value. */
function choice(id, label, options, onChange) {
  const wrap = document.createElement('div');
  const text = document.createElement('label');
  text.htmlFor = id;
  text.textContent = label;
  const select = document.createElement('select');
  select.id = id;
  for (const [value, name] of options) select.append(new Option(name, value));
  select.addEventListener('change', () => onChange(select.value));
  wrap.append(text, select);
  return wrap;
}

const root = document.documentElement;
const sheet = document.getElementById('theme-sheet');
document.querySelector('[data-lesson-controls]').append(
  choice('look', 'Look', LOOKS, (value) => {
    sheet.href = sheet.href.replace(/[^/]+\.css$/, `${value}.css`);
    root.setAttribute('data-lk-theme', value);
  }),
  choice('mode', 'Mode', MODES, (value) => {
    if (value) root.setAttribute('data-lk-mode', value);
    else root.removeAttribute('data-lk-mode');
  })
);

const total = Number(document.body.dataset.activities);
const done = new Set();
const bar = document.getElementById('progress');

function finish(key) {
  if (done.has(key)) return;
  done.add(key);
  bar.setAttribute('value', String(Math.round((done.size / total) * 100)));
  toast(done.size === total ? `All ${total} activities finished. Well done!` : `${done.size} of ${total} activities finished`, { tone: 'success' });
}

document.addEventListener('lk-check', (e) => {
  if (e.detail.score === e.detail.total) finish(e.target.localName);
});
document.addEventListener('lk-end', (e) => finish(e.target.localName));
document.addEventListener('lk-complete', (e) => {
  if (e.target.localName === 'lk-quiz') finish('lk-quiz');
});
