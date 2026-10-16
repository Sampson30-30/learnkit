import { test, assert, equal, waitFor, tick } from './harness.js';

async function openHome(width) {
  const frame = document.createElement('iframe');
  frame.style.cssText = `position:absolute;left:-9999px;top:0;width:${width}px;height:900px;border:0`;
  frame.src = '../../';
  document.body.append(frame);
  await new Promise((resolve) => { frame.onload = resolve; });
  const doc = frame.contentDocument;
  await waitFor(() => doc.querySelectorAll('.piece').length > 0 && doc.querySelectorAll('.look').length > 0, 4000);
  return { frame, doc, win: frame.contentWindow };
}

test('home: the library shows every piece live, grouped on shelves', async () => {
  const { frame, doc } = await openHome(1200);
  try {
    equal(doc.querySelectorAll('[data-lk-tab], #shelves [role=tab]').length > 0, true);
    const shelfTabs = [...doc.querySelectorAll('#shelves [role=tablist] [role=tab]')].filter((t) => t.closest('lk-tabs').parentElement.id === 'shelves');
    equal(shelfTabs.length, 5);
    const pieces = [...doc.querySelectorAll('.piece')];
    equal(pieces.length, 33);
    for (const p of pieces) {
      assert(p.querySelector('.piece__demo').children.length > 0, `${p.querySelector('.piece__name').textContent} has no live demo`);
      assert(p.querySelector('.piece__what').textContent.length > 10, 'each piece says what it is');
    }
    assert(doc.getElementById('library-count').textContent.startsWith('33 pieces on 5 shelves'));
  } finally {
    frame.remove();
  }
});

test('home: every piece links to the gallery for that piece, and the links are distinguishable', async () => {
  const { frame, doc } = await openHome(1200);
  try {
    const links = [...doc.querySelectorAll('.piece__more a')];
    equal(links.length, 33);
    const names = links.map((a) => a.textContent);
    equal(new Set(names).size, 33, 'every link has a different accessible name');
    for (const a of links) assert(/gallery\/#view=compare&component=[\w-]+$/.test(a.getAttribute('href')), a.getAttribute('href'));
    // the part added for screen readers is not shown
    const hidden = links[0].querySelector('.lk-visually-hidden');
    assert(hidden && hidden.getBoundingClientRect().width <= 1.5, 'the extra words are visually hidden');
  } finally {
    frame.remove();
  }
});

test('home: the sample at the top works', async () => {
  const { frame, doc } = await openHome(1200);
  try {
    const cards = doc.querySelector('#sample lk-flashcards');
    await waitFor(() => cards.querySelector('button'), 2000);
    equal(cards.querySelector('.lk-flashcards__front').textContent, 'What is LearnKit?');
    [...cards.querySelectorAll('button')].find((b) => b.textContent === 'Show answer').click();
    assert(cards.querySelector('.lk-flashcards__back').textContent.includes('ready-made pieces'));
  } finally {
    frame.remove();
  }
});

test('home: each look is visibly its own look', async () => {
  const { frame, doc, win } = await openHome(1200);
  try {
    const looks = [...doc.querySelectorAll('.look')];
    equal(looks.length, 6);
    const signature = (l) => {
      const s = win.getComputedStyle(l);
      const b = win.getComputedStyle(l.querySelector('.lk-button[data-variant=primary]'));
      return [s.backgroundColor, b.backgroundColor, s.fontFamily, b.borderRadius].join('|');
    };
    equal(new Set(looks.map(signature)).size, 6, 'no two looks are the same');
  } finally {
    frame.remove();
  }
});

test('home: nothing makes the page scroll sideways on a phone, on any shelf', async () => {
  const { frame, doc, win } = await openHome(375);
  try {
    const tabs = [...doc.querySelectorAll('#shelves [role=tablist] [role=tab]')].filter((t) => t.closest('lk-tabs').parentElement.id === 'shelves');
    for (const tab of tabs) {
      tab.click();
      await tick(150);
      assert(doc.documentElement.scrollWidth <= win.innerWidth + 1, `"${tab.textContent}" is ${doc.documentElement.scrollWidth}px wide in a ${win.innerWidth}px window`);
    }
  } finally {
    frame.remove();
  }
});

test('home: the area for the person who looks after the code is last and closed', async () => {
  const { frame, doc } = await openHome(1200);
  try {
    const area = doc.querySelector('.maintainers');
    assert(area && !area.open, 'closed by default');
    assert(area === doc.querySelector('main').lastElementChild, 'last on the page');
    assert(area.querySelector('a[href="docs/getting-started.md"]'));
  } finally {
    frame.remove();
  }
});
