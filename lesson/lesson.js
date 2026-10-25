// Behaviour shared by the sample lessons: the look switcher and the progress bar.
//
// A lesson needs, in its page:
//   <link id="theme-sheet" ...>               the current theme's stylesheet
//   <select id="look">                        values are theme file names, such as "clean"
//   <lk-progress id="progress" value="0">     the bar
//   <body data-activities="5">                how many activities count towards it
import { toast } from '../src/index.js';

const sheet = document.getElementById('theme-sheet');
const select = document.getElementById('look');
select.addEventListener('change', () => {
  sheet.href = sheet.href.replace(/[^/]+\.css$/, `${select.value}.css`);
  document.documentElement.setAttribute('data-lk-theme', select.value);
});

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
