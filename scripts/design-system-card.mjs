// The preview.html and README.md for the LearnKit card in a Claude Design system.
// Used by bundle-for-design-system.mjs --card. Copy has no em dashes (BLC rule).
const BRANDS = {
  blc: { name: 'Blended Learning Consortium', short: 'BLC' },
  howdigital: { name: 'HoW Digital', short: 'HoW Digital' },
};

const PANEL = `
<section class="panel" data-lk-theme="__THEME__" data-lk-mode="__MODE__" aria-label="__MODE_LABEL__ theme">
  <h2>__MODE_LABEL__</h2>

  <h3>Tabs</h3>
  <lk-tabs label="Course sections">
    <div data-lk-tab="Overview"><p>A short course on writing clearly for learners.</p></div>
    <div data-lk-tab="Outcomes"><p>By the end you can plan, draft and edit a page of plain English.</p></div>
    <div data-lk-tab="Support"><p>Ask the tutor or the learning team at any time.</p></div>
  </lk-tabs>

  <h3>Accordion</h3>
  <lk-accordion label="Common questions">
    <div data-lk-item="How long does it take?" open><p>About forty minutes, in as many sittings as you like.</p></div>
    <div data-lk-item="Can I come back later?"><p>Yes. Your progress is kept on this device.</p></div>
    <div data-lk-item="Is there a certificate?"><p>You get one when you finish the final check.</p></div>
  </lk-accordion>

  <h3>Modal</h3>
  <button type="button" class="lk-button" data-lk-open="m-__MODE__">Open the dialog</button>
  <lk-modal id="m-__MODE__" heading="Leave this activity?">
    <p>Your answers so far will be saved, and you can pick up where you left off.</p>
    <p><button type="button" class="lk-button" data-lk-close="stay">Stay here</button>
       <button type="button" class="lk-button" data-lk-close="leave">Leave</button></p>
  </lk-modal>

  <h3>Field and choices</h3>
  <lk-field label="Your name" hint="As you would like it to appear on your certificate.">
    <input type="text" name="name-__MODE__" autocomplete="off">
  </lk-field>
  <lk-field label="Email address" error="Enter an email address, for example name@example.com.">
    <input type="email" name="email-__MODE__" value="name@">
  </lk-field>
  <lk-choices legend="How do you like to learn?" hint="Choose all that apply.">
    <label><input type="checkbox" name="how-__MODE__"> In short bursts</label>
    <label><input type="checkbox" name="how-__MODE__" checked> With examples</label>
    <label><input type="checkbox" name="how-__MODE__"> With others</label>
  </lk-choices>

  <h3>Alert</h3>
  <lk-alert tone="info" heading="Tip">Press Tab to move between activities.</lk-alert>
  <lk-alert tone="success" heading="Saved">Your answers have been saved.</lk-alert>
  <lk-alert tone="warning" heading="Deadline moved" dismissible>Submit by Friday instead.</lk-alert>
  <lk-alert tone="danger" heading="Could not save">Check your connection and try again.</lk-alert>

  <h3>Quiz</h3>
  <lk-quiz label="Check your understanding" title="Quick check">
    <div data-lk-question="Which of these is formative assessment?">
      <div data-lk-option correct data-feedback="Yes: it informs teaching as it happens.">A quick quiz during the lesson</div>
      <div data-lk-option data-feedback="Not quite: that happens at the end.">A final exam</div>
      <p data-lk-explanation>Formative assessment happens during learning, to help it along.</p>
    </div>
  </lk-quiz>

  <h3>Table</h3>
  <lk-table label="Courses this term" sortable filter striped>
    <table>
      <caption>Courses this term</caption>
      <thead><tr><th>Course</th><th>Hours</th><th>Format</th></tr></thead>
      <tbody>
        <tr><td>Plain English</td><td>3</td><td>Online</td></tr>
        <tr><td>Designing activities</td><td>12</td><td>Blended</td></tr>
        <tr><td>Accessible documents</td><td>6</td><td>Online</td></tr>
        <tr><td>Feedback that helps</td><td>4</td><td>Workshop</td></tr>
      </tbody>
    </table>
  </lk-table>

  <h3>Stepper</h3>
  <lk-stepper current="1" label="Enrolment steps">
    <ol><li>Your details</li><li>Choose a course</li><li>Confirm</li></ol>
  </lk-stepper>

  <h3>Glossary</h3>
  <lk-glossary label="Key terms">
    <dl>
      <dt>Formative assessment</dt><dd>Checking progress during learning, to help it along.</dd>
      <dt>Summative assessment</dt><dd>Judging what has been learned at the end.</dd>
      <dt>Rubric</dt><dd>A grid that shows what each level of work looks like.</dd>
    </dl>
  </lk-glossary>

  <h3>Flow</h3>
  <lk-flow label="A late submission" walkthrough>
    <ol>
      <li data-type="start">Work arrives after the deadline</li>
      <li>Was an extension agreed?
        <ul>
          <li data-label="Yes">Mark as normal</li>
          <li data-label="No">Apply the late penalty</li>
        </ul>
      </li>
      <li data-type="end">Return feedback</li>
    </ol>
  </lk-flow>
</section>`;

export function card(theme, version) {
  const brand = BRANDS[theme];
  const panel = (mode, label) => PANEL
    .replaceAll('__THEME__', theme).replaceAll('__MODE__', mode).replaceAll('__MODE_LABEL__', label);
  const preview = `<!-- @dsCard group="Components" height=4800 subtitle="Ten LearnKit components in ${brand.short}, light and dark" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="./learnkit.css">
<style>
  html, body { margin: 0; background: var(--surface, #fff); color: var(--ink, #111); }
  body { padding: 16px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 16px; align-items: start; }
  .panel { padding: 24px; border: 1px solid var(--lk-color-border); border-radius: 8px;
    background: var(--lk-color-page); color: var(--lk-color-text); font-family: var(--lk-font); }
  .panel h2 { font-family: var(--lk-font-heading); margin: 0 0 8px; }
  .panel h3 { font-family: var(--lk-font-heading); font-size: 14px; margin: 28px 0 8px; color: var(--lk-color-muted); text-transform: uppercase; letter-spacing: .04em; }
  .panel lk-alert, .panel lk-field, .panel lk-choices { display: block; margin-bottom: 12px; }
</style>
</head>
<body>
<div class="grid">${panel('light', 'Light')}${panel('dark', 'Dark')}
</div>
<script src="./learnkit.js"></script>
</body>
</html>
`;
  const readme = `LearnKit in ${brand.name}: accessible interactive components, with no dependencies, that take their colours from this design system.

This card loads \`learnkit.js\` and \`learnkit.css\` from this folder. The script assigns \`window.LearnKit\` and registers every component as a custom element, so it needs no other script. The stylesheet holds the LearnKit base styles and the ${brand.short} theme, and the theme's colours are taken from this system's tokens. Colours are never edited here: change them in \`tokens.json\`, then bring the LearnKit theme back in line.

LearnKit version: ${version}.

## Use

\`\`\`html
<link rel="stylesheet" href="learnkit.css">
<script src="learnkit.js"></script>

<div data-lk-theme="${theme}">
  <lk-alert tone="info" heading="Tip">Press Tab to move between activities.</lk-alert>
</div>
\`\`\`

- Put \`data-lk-theme="${theme}"\` on the page or on a wrapper to scope the look to one section.
- Add \`data-lk-mode="dark"\` to the same element for the dark theme. Leave it off for light.
- Components in this card: tabs, accordion, modal, field and choices, alert, quiz, table, stepper, glossary and flow. The bundle holds every other LearnKit component too.

## Guidelines

- Every component works from the keyboard alone and keeps a visible focus ring.
- Status never relies on colour alone: alerts and errors add a word, and fields add an error message.
- Content is plain markup inside the element, so it still reads without scripting.

The consumer provides: the content, the heading levels that suit the page, and a unique \`id\` for every modal.

## Keeping this card current

The bundle is generated from the LearnKit repository with \`npm run bundle -- --theme ${theme} --card\`, which writes this whole folder. Do not edit \`learnkit.js\` or \`learnkit.css\` by hand.
`;
  return { 'preview.html': preview, 'README.md': readme };
}
