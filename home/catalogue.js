// What is in the library, grouped by what each piece is for. Plain English,
// written for someone who has never seen this before. The home page shows
// every entry live, using the same demo markup as the gallery.
//
// `id` is the gallery demo's id. `tags` are the names to ask Claude for.
// `wide` gives a piece more room in the grid.
// A test checks that every piece in the gallery is on exactly one shelf.

export const SHELVES = [
  {
    id: 'check',
    title: 'Check understanding',
    blurb: 'Ways for learners to practise, test themselves and see how they are doing.',
    pieces: [
      { id: 'lk-quiz', tags: 'lk-quiz', name: 'Quiz', what: 'Questions with instant feedback. Learners can try again.' },
      { id: 'lk-flashcards', tags: 'lk-flashcards', name: 'Flashcards', what: 'Practise recall. Cards a learner misses come round again.' },
      { id: 'lk-order', tags: 'lk-order', name: 'Put in order', what: 'Learners arrange steps into the right order, using buttons or by dragging.' },
      { id: 'lk-sort', tags: 'lk-sort', name: 'Sort into groups', what: 'Learners sort items into groups, by dragging or with a menu, and check their answers.', wide: true },
      { id: 'lk-respond', tags: 'lk-respond', name: 'Choose a response', what: 'Learners choose how they would respond to each situation, see what would happen, then check them all together.', wide: true },
      { id: 'lk-matrix', tags: 'lk-matrix', name: 'Fill-in table', what: 'A table where learners type or tick the missing cells, then check their answers.', wide: true },
      { id: 'lk-spectrum', tags: 'lk-spectrum', name: 'Comparison spectrum', what: 'Learners place their view on a slider, then see where an expert would put it.' },
      { id: 'lk-rating', tags: 'lk-rating', name: 'Self-assessment', what: 'Learners rate how confident they feel, and see a summary.' },
    ],
  },
  {
    id: 'story',
    title: 'Tell a story or show a process',
    blurb: 'Ways to walk learners through a situation, a sequence or a decision.',
    pieces: [
      { id: 'lk-scenario', tags: 'lk-scenario', name: 'Scenario', what: 'A story where the learner’s choices change what happens next.', wide: true },
      { id: 'lk-flow', tags: 'lk-flow', name: 'Process chart and decision tree', what: 'Draw a process, or a set of questions that leads to an answer. Learners can walk through it and see their route.', wide: true },
      { id: 'lk-timeline', tags: 'lk-timeline', name: 'Timeline', what: 'Events in order. Show them all, or reveal them one at a time.', wide: true },
      { id: 'lk-process', tags: 'lk-process', name: 'Step-by-step process', what: 'A walkthrough where every step has its own content.', wide: true },
      { id: 'lk-hotspot', tags: 'lk-hotspot', name: 'Hotspot picture', what: 'Numbered points on a picture. Choosing one explains that part.', wide: true },
      { id: 'lk-grid-explorer', tags: 'lk-grid-explorer', name: 'Grid explorer', what: 'A grid of tiles. Each opens to more, and the grid keeps track of what has been read.' },
    ],
  },
  {
    id: 'organise',
    title: 'Organise content',
    blurb: 'Ways to lay out a lot of information so that it is easy to find and read.',
    pieces: [
      { id: 'lk-tabs', tags: 'lk-tabs', name: 'Tabs', what: 'Split content into sections and show one at a time.' },
      { id: 'lk-accordion', tags: 'lk-accordion', name: 'Accordion', what: 'Headings that open and close to reveal more.' },
      { id: 'lk-tree', tags: 'lk-tree', name: 'Tree', what: 'A course outline that opens and closes, with one tab stop for the keyboard.' },
      { id: 'lk-glossary', tags: 'lk-glossary', name: 'Glossary', what: 'Terms and meanings in A to Z order, with a search box and a link for each letter.', wide: true },
      { id: 'lk-table', tags: 'lk-table', name: 'Table', what: 'A table that learners can sort and filter.', wide: true },
      { id: 'cards', tags: '.lk-card, .lk-divider, .lk-skeleton', name: 'Cards, dividers and placeholders', what: 'Simple boxes and lines to group things, and grey shapes to show while content loads.' },
      { id: 'lk-nav', tags: 'lk-breadcrumbs, lk-pagination', name: 'Breadcrumbs and pagination', what: 'Show where someone is, and move between pages of results.' },
    ],
  },
  {
    id: 'guide',
    title: 'Guide and respond',
    blurb: 'Ways to get attention, give feedback and help people find their way.',
    pieces: [
      { id: 'lk-modal', tags: 'lk-modal', name: 'Modal dialog', what: 'A box that appears over the page and asks for attention.' },
      { id: 'lk-drawer', tags: 'lk-drawer', name: 'Drawer', what: 'A panel that slides in from the side.' },
      { id: 'lk-menu', tags: 'lk-menu', name: 'Menu', what: 'A button that opens a list of actions.' },
      { id: 'lk-popover', tags: 'lk-tooltip, lk-popover', name: 'Tooltip and popover', what: 'A small hint when someone points at or focuses something, or a panel that opens next to a button.' },
      { id: 'lk-toasts', tags: 'toast()', name: 'Notifications', what: 'Brief messages that appear and fade away, such as “Saved”.' },
      { id: 'lk-alert', tags: 'lk-alert', name: 'Alert', what: 'A message that sits in the page, such as a tip or a warning.' },
      { id: 'lk-progress', tags: 'lk-progress, lk-stepper', name: 'Progress and stepper', what: 'Show how far along someone is.' },
      { id: 'lk-guide', tags: '.lk-guide', name: 'About this page panel', what: 'A plain-English panel that says what a page is for and what to do on it.' },
    ],
  },
  {
    id: 'collect',
    title: 'Collect and personalise',
    blurb: 'Ways for learners to write, choose and make things their own.',
    pieces: [
      { id: 'lk-journal', tags: 'lk-journal', name: 'Reflection journal', what: 'Prompts for learners to write in. Notes stay on their device and can be copied or downloaded.' },
      { id: 'lk-field', tags: 'lk-field, lk-choices', name: 'Form controls', what: 'Labelled boxes, lists, sliders and choices, with clear messages when something is missing.' },
      { id: 'lk-switch', tags: 'lk-switch', name: 'Switch', what: 'An on/off setting.' },
      { id: 'lk-chip', tags: 'lk-chip', name: 'Chips', what: 'Small labels that can be selected or removed, such as tags.' },
      { id: 'lk-avatar', tags: 'lk-avatar', name: 'Avatars', what: 'A person’s picture, or their initials.' },
      { id: 'buttons', tags: '.lk-button, .lk-badge', name: 'Buttons and badges', what: 'Buttons in several styles, and small coloured labels.' },
    ],
  },
];

/** A sample to try straight away at the top of the page. */
export const HERO_SAMPLE = {
  label: 'What is LearnKit?',
  cards: [
    ['What is LearnKit?', 'A library of ready-made pieces for learning content, such as quizzes, timelines and flashcards.'],
    ['Do I have to build the pieces myself?', 'No. You choose the ones you want and ask Claude to use them.'],
    ['Can I change how they look?', 'Yes. Pick one of the looks, or make your own in the customiser.'],
  ],
};

/** The pieces in order, flat. */
export const ALL_PIECES = SHELVES.flatMap((s) => s.pieces);
