// One demo per component. Each is a function of a unique suffix so several
// copies can share a page without clashing ids.

export const THEMES = [
  { id: '', name: 'Default', note: 'The built-in look. No theme file.' },
  { id: 'homepage', name: 'Homepage', note: 'Mid 1990s document web, rebuilt with modern CSS.' },
  { id: 'clean', name: 'Clean', note: 'Quiet and modern: rounded, soft shadows, teal.' },
  { id: 'contrast', name: 'Contrast', note: 'High contrast, WCAG AAA text, no shadows.' },
  { id: 'bold', name: 'Bold', note: 'Thick outlines, flat colour, hard shadows.' },
  { id: 'soft', name: 'Soft', note: 'Gentle, rounded, warm neutrals and berry.' },
  { id: 'blc', name: 'Blended Learning Consortium', note: 'The BLC look: white and warm grey, charcoal text, BLC pink.' },
  { id: 'howdigital', name: 'HoW Digital', note: 'Bold and friendly: dark ink, bright coral, sky, orchid and lime.' },
  { id: 'sankofa', name: 'Sankofa', note: 'Calm and warm: paper tones, brown ink, indigo, serif text, no shadows.' },
];

export const DEMOS = [
  {
    id: 'lk-tabs',
    title: 'Tabs',
    html: () => `
      <lk-tabs label="Course sections">
        <div data-lk-tab="Overview"><p>Each child marked with a tab title becomes a tab.</p></div>
        <div data-lk-tab="Details"><p>Arrow keys, Home and End move between tabs.</p></div>
        <div data-lk-tab="Summary"><p>The last panel.</p></div>
      </lk-tabs>`,
  },
  {
    id: 'lk-accordion',
    title: 'Accordion',
    html: () => `
      <lk-accordion label="Course topics">
        <div data-lk-item="What you will learn" open><p>One section is open at a time by default.</p></div>
        <div data-lk-item="How it is assessed"><p>Up and Down arrows move between headings.</p></div>
        <div data-lk-item="What you need"><p>Enter or Space opens a section.</p></div>
      </lk-accordion>`,
  },
  {
    id: 'lk-modal',
    title: 'Modal dialog',
    html: (u) => `
      <p class="row"><button type="button" class="lk-button" data-variant="primary" data-lk-open="modal-${u}">Open a modal</button></p>
      <lk-modal id="modal-${u}" heading="Course details">
        <p>Focus stays inside while this is open. Press Escape, use the close button or click outside to dismiss it.</p>
        <div class="lk-modal__actions"><button type="button" class="lk-button" data-variant="primary" data-lk-close="ok">Got it</button></div>
      </lk-modal>`,
  },
  {
    id: 'lk-popover',
    title: 'Tooltip and popover',
    html: (u) => `
      <p class="row">
        <button type="button" class="lk-button" id="tip-${u}">Hover or focus me</button>
        <lk-tooltip for="tip-${u}">Opens the course guide</lk-tooltip>
        <button type="button" class="lk-button" data-lk-popover="pop-${u}">More about this</button>
      </p>
      <lk-popover id="pop-${u}" label="About this topic"><p>Popovers can hold <a href="#">links</a> and controls.</p></lk-popover>`,
  },
  {
    id: 'buttons',
    title: 'Buttons and badges',
    html: () => `
      <p class="row">
        <button type="button" class="lk-button">Default</button>
        <button type="button" class="lk-button" data-variant="primary">Primary</button>
        <button type="button" class="lk-button" data-variant="danger">Delete</button>
        <button type="button" class="lk-button" data-variant="link">Link style</button>
        <button type="button" class="lk-button" data-size="small">Small</button>
        <button type="button" class="lk-button" disabled>Disabled</button>
      </p>
      <p class="row">
        <span class="lk-badge">Draft</span>
        <span class="lk-badge" data-tone="primary">New</span>
        <span class="lk-badge" data-tone="success">Complete</span>
        <span class="lk-badge" data-tone="warning">Due soon</span>
        <span class="lk-badge" data-tone="danger">Overdue</span>
        <span class="lk-badge" data-tone="info">Optional</span>
      </p>`,
  },
  {
    id: 'lk-field',
    title: 'Form controls',
    html: (u) => `
      <lk-field label="Email address" hint="We will only use this to reply to your message" error="Enter an email address, like name@example.com">
        <input type="email" required />
      </lk-field>
      <lk-field label="Course"><select><option>Introduction to teaching</option><option>Assessment for learning</option></select></lk-field>
      <lk-field label="Your comments"><textarea rows="2"></textarea></lk-field>
      <lk-field label="How confident do you feel?"><input type="range" min="0" max="10" value="6" /></lk-field>
      <lk-choices legend="Preferred format" hint="Choose one">
        <label><input type="radio" name="format-${u}" checked /> Online</label>
        <label><input type="radio" name="format-${u}" /> Blended</label>
      </lk-choices>
      <lk-choices legend="Topics" hint="Choose at least two" min="2">
        <label><input type="checkbox" checked /> Assessment</label>
        <label><input type="checkbox" /> Feedback</label>
        <label><input type="checkbox" /> Planning</label>
      </lk-choices>`,
  },
  {
    id: 'lk-progress',
    title: 'Progress and stepper',
    html: () => `
      <div class="gap">
        <lk-progress label="Course progress" value="60" show-value></lk-progress>
        <lk-progress label="Loading"></lk-progress>
        <lk-stepper current="1" label="Enrolment steps"><ol><li>Your details</li><li>Choose a course</li><li>Confirm</li></ol></lk-stepper>
      </div>`,
  },
  {
    id: 'lk-toasts',
    title: 'Toast notifications',
    html: () => `
      <p class="row">
        <button type="button" class="lk-button" data-gallery-toast="success">Confirmation</button>
        <button type="button" class="lk-button" data-gallery-toast="warning">Warning with undo</button>
        <button type="button" class="lk-button" data-gallery-toast="danger">Error</button>
      </p>`,
  },
  {
    id: 'lk-quiz',
    title: 'Quiz',
    html: () => `
      <lk-quiz label="Check your understanding" title="Formative assessment">
        <div data-lk-question="Which of these is formative assessment?">
          <div data-lk-option correct data-feedback="Yes: it informs the next lesson.">A quick quiz in class</div>
          <div data-lk-option>A final exam</div>
          <div data-lk-option>An end-of-year report</div>
          <p data-lk-explanation>Formative assessment happens during learning, to guide teaching.</p>
        </div>
      </lk-quiz>`,
  },
  {
    id: 'lk-journal',
    title: 'Reflection journal',
    html: () => `
      <lk-journal title="Week 1 reflection">
        <div data-lk-prompt="What went well this week?" data-hint="Think about one lesson."></div>
        <div data-lk-prompt="What would you change next time?"></div>
      </lk-journal>`,
  },
  {
    id: 'lk-spectrum',
    title: 'Comparison spectrum',
    html: () => `
      <lk-spectrum statement="How should feedback be given?" left="Written" right="Spoken" expert="70"
        explanation="Spoken feedback allows a conversation, but write down the key points."></lk-spectrum>`,
  },
  {
    id: 'lk-rating',
    title: 'Self-assessment',
    html: () => `
      <lk-rating label="How confident are you?" scale="5" low="Not at all" high="Completely" summary>
        <div data-lk-statement="Planning a lesson"></div>
        <div data-lk-statement="Giving feedback"></div>
      </lk-rating>`,
  },
  {
    id: 'lk-timeline',
    title: 'Timeline',
    html: () => `
      <lk-timeline label="History" collapsible>
        <div data-lk-date="1962" data-title="Founded"><p>The first classes began.</p></div>
        <div data-lk-date="1990" data-title="New campus"><p>A move to the current site.</p></div>
        <div data-lk-date="2024" data-title="Blended learning"><p>Online and face-to-face combined.</p></div>
      </lk-timeline>`,
  },
  {
    id: 'lk-grid-explorer',
    title: 'Grid explorer',
    html: () => `
      <lk-grid-explorer label="Learning theories" columns="2">
        <div data-lk-cell="Behaviourism"><p>Learning as a change in behaviour.</p></div>
        <div data-lk-cell="Cognitivism"><p>Learning as processing information.</p></div>
        <div data-lk-cell="Constructivism"><p>Learners build knowledge.</p></div>
        <div data-lk-cell="Social learning"><p>Learning with others.</p></div>
      </lk-grid-explorer>`,
  },
  {
    id: 'lk-process',
    title: 'Step-by-step process',
    html: () => `
      <lk-process label="Planning a lesson">
        <div data-lk-step="Set the outcome"><p>Decide what learners will be able to do.</p></div>
        <div data-lk-step="Plan the activities"><p>Choose activities that let learners practise.</p></div>
        <div data-lk-step="Check understanding"><p>Decide how you will know it worked.</p></div>
      </lk-process>`,
  },
  {
    id: 'lk-scenario',
    title: 'Scenario',
    html: () => `
      <lk-scenario label="A late submission" start="start">
        <div data-lk-node="start" data-title="An email arrives">
          <p>A learner who has never been late before asks for an extra week.</p>
          <ul data-lk-choices>
            <li data-lk-goto="strict">Refuse: the deadline was clear</li>
            <li data-lk-goto="ext">Agree and arrange a check-in</li>
          </ul>
        </div>
        <div data-lk-node="strict" data-end data-outcome="poor" data-title="The learner disengages"><p>They stop attending.</p></div>
        <div data-lk-node="ext" data-end data-outcome="good" data-title="The learner catches up"><p>They submit on the new date.</p></div>
      </lk-scenario>`,
  },
  {
    id: 'lk-table',
    title: 'Table',
    html: () => `
      <lk-table label="Courses this term" sortable filter striped>
        <table>
          <caption>Courses this term</caption>
          <thead><tr><th>Course</th><th data-type="number">Hours</th><th>Level</th></tr></thead>
          <tbody>
            <tr><td>Mathematics</td><td>30</td><td>Level 2</td></tr>
            <tr><td>Art and design</td><td>9</td><td>Level 1</td></tr>
            <tr><td>English</td><td>100</td><td>Level 2</td></tr>
            <tr><td>Digital skills</td><td>45</td><td>Level 3</td></tr>
          </tbody>
        </table>
      </lk-table>`,
  },
  {
    id: 'lk-alert',
    title: 'Alert',
    html: () => `
      <lk-alert tone="info" heading="Good to know">Your progress is saved on this device.</lk-alert>
      <p></p>
      <lk-alert tone="success" heading="Saved">Your answers were recorded.</lk-alert>
      <p></p>
      <lk-alert tone="warning" heading="Deadline moved" dismissible>Submit by Friday instead.</lk-alert>
      <p></p>
      <lk-alert tone="danger">That did not work. Try again.</lk-alert>`,
  },
  {
    id: 'lk-chip',
    title: 'Chips',
    html: () => `
      <p class="row">
        <lk-chip>Level 2</lk-chip>
        <lk-chip tone="success">Complete</lk-chip>
        <lk-chip selectable selected>Maths</lk-chip>
        <lk-chip selectable>English</lk-chip>
        <lk-chip removable>Evening</lk-chip>
      </p>`,
  },
  {
    id: 'lk-avatar',
    title: 'Avatars',
    html: () => `
      <p class="row">
        <lk-avatar name="Ada Lovelace" size="sm"></lk-avatar>
        <lk-avatar name="Grace Hopper"></lk-avatar>
        <lk-avatar name="Alan Turing" size="lg"></lk-avatar>
        <lk-avatar name="Katherine Johnson" tone="info"></lk-avatar>
        <span class="lk-avatar-group">
          <lk-avatar name="Margaret Hamilton"></lk-avatar>
          <lk-avatar name="Tim Berners-Lee"></lk-avatar>
          <lk-avatar name="Hedy Lamarr"></lk-avatar>
        </span>
      </p>`,
  },
  {
    id: 'lk-switch',
    title: 'Switch',
    html: () => `
      <lk-switch label="Email reminders" hint="One a week, on Mondays" checked></lk-switch>
      <p></p>
      <lk-switch label="Show answers as I go"></lk-switch>
      <p></p>
      <lk-switch label="Unavailable setting" disabled></lk-switch>`,
  },
  {
    id: 'lk-nav',
    title: 'Breadcrumbs and pagination',
    html: () => `
      <lk-breadcrumbs label="You are here" max="4">
        <ol>
          <li><a href="#">Home</a></li><li><a href="#">Courses</a></li><li><a href="#">Level 2</a></li>
          <li><a href="#">Mathematics</a></li><li>Unit 1</li>
        </ol>
      </lk-breadcrumbs>
      <p></p>
      <lk-pagination label="Results" total="12" page="5"></lk-pagination>`,
  },
  {
    id: 'cards',
    title: 'Cards, dividers and skeletons',
    html: () => `
      <div class="lk-card">
        <h3>A card</h3>
        <p>A bordered, padded surface for a self-contained piece of content.</p>
        <div class="lk-card__footer"><button type="button" class="lk-button" data-variant="primary">Open</button></div>
      </div>
      <hr class="lk-divider" />
      <div aria-busy="true">
        <span class="lk-skeleton" data-variant="circle" aria-hidden="true"></span>
        <span class="lk-skeleton" aria-hidden="true" style="width: 60%"></span>
        <span class="lk-skeleton" aria-hidden="true"></span>
        <span class="lk-skeleton" aria-hidden="true" style="width: 80%"></span>
      </div>`,
  },
  {
    id: 'lk-flashcards',
    title: 'Flashcards',
    html: () => `
      <lk-flashcards label="Assessment terms" shuffle>
        <div data-lk-card="Formative assessment">Assessment <strong>during</strong> learning, used to shape what happens next.</div>
        <div data-lk-card="Summative assessment">Assessment at the <strong>end</strong>, used to judge what was learned.</div>
        <div data-lk-card="Feedback">Information that helps the learner close the gap between where they are and where they need to be.</div>
      </lk-flashcards>`,
  },
  {
    id: 'lk-order',
    title: 'Put in order',
    html: () => `
      <lk-order label="Put the writing process in order">
        <ol><li>Plan</li><li>Draft</li><li>Revise</li><li>Publish</li></ol>
      </lk-order>`,
  },
  {
    id: 'lk-sort',
    title: 'Sort into groups',
    html: () => `
      <lk-sort label="Sort each example into the right kind of assessment">
        <ul data-lk-group="Formative">
          <li>A quiz in class</li><li>Feedback on a draft</li>
        </ul>
        <ul data-lk-group="Summative">
          <li>A final exam</li><li>An end-of-year report</li>
        </ul>
      </lk-sort>`,
  },
  {
    id: 'lk-matrix',
    title: 'Fill-in table',
    html: () => `
      <lk-matrix label="Complete the table, then tick who learns by doing" show-answers>
        <table>
          <caption>Learning theories</caption>
          <thead><tr><th>Theory</th><th>Main idea</th><th>Learner is active</th></tr></thead>
          <tbody>
            <tr><th>Behaviourism</th><td data-answer="Habits|Behaviour">Behaviour</td><td data-tick="no"></td></tr>
            <tr><th>Constructivism</th><td data-answer="Meaning|Building knowledge">Meaning</td><td data-tick="yes"></td></tr>
            <tr><th>Social learning</th><td data-answer="Watching others|Observation">Observation</td><td data-tick="yes"></td></tr>
          </tbody>
        </table>
      </lk-matrix>`,
  },
  {
    id: 'lk-glossary',
    title: 'Glossary',
    html: () => `
      <lk-glossary label="Assessment terms">
        <dl>
          <dt>Summative assessment</dt><dd>Judging what has been learned at the end.</dd>
          <dt>Formative assessment</dt><dd>Checking progress during learning, to help it along.</dd>
          <dt>Feedback</dt><dd>Comments that tell a learner how to improve.</dd>
          <dt>Criteria</dt><dd>The standards a piece of work is judged against.</dd>
          <dt>Moderation</dt><dd>Checking that marking is fair and consistent.</dd>
        </dl>
      </lk-glossary>`,
  },
  {
    id: 'lk-hotspot',
    title: 'Hotspot picture',
    html: () => `
      <lk-hotspot label="Parts of a plant">
        <svg viewBox="0 0 200 120" role="img" aria-label="A simple plant with a flower, a stem and roots" style="background: #e8f1e4">
          <circle cx="100" cy="22" r="14" fill="#d9467a" /><rect x="97" y="36" width="6" height="52" fill="#2f7d3a" />
          <ellipse cx="82" cy="62" rx="14" ry="6" fill="#3f9a4d" /><path d="M100 88 L70 112 M100 88 L100 114 M100 88 L130 112" stroke="#7a5230" stroke-width="3" fill="none" />
        </svg>
        <div data-lk-spot data-x="50" data-y="18" data-title="Flower">Makes the seeds for the next plant.</div>
        <div data-lk-spot data-x="41" data-y="52" data-title="Leaf">Catches light to make food.</div>
        <div data-lk-spot data-x="50" data-y="90" data-title="Roots">Take in water and hold the plant in place.</div>
      </lk-hotspot>`,
  },
  {
    id: 'lk-menu',
    title: 'Menu',
    html: () => `
      <lk-menu label="More actions">
        <button data-lk-item value="duplicate">Duplicate</button>
        <a data-lk-item href="#export">Export as PDF</a>
        <hr />
        <button data-lk-item value="archive" disabled>Archive</button>
        <button data-lk-item value="delete">Delete</button>
      </lk-menu>`,
  },
  {
    id: 'lk-tree',
    title: 'Tree',
    html: () => `
      <lk-tree label="Course contents">
        <ul>
          <li open>Unit 1: Planning
            <ul>
              <li>Setting objectives</li>
              <li>Choosing activities<ul><li>Group work</li><li>Independent study</li></ul></li>
            </ul>
          </li>
          <li>Unit 2: Assessment<ul><li>Formative methods</li><li>Summative methods</li></ul></li>
          <li>Unit 3: Review</li>
        </ul>
      </lk-tree>`,
  },
  {
    id: 'lk-drawer',
    title: 'Drawer',
    html: (u) => `
      <p class="row">
        <button type="button" class="lk-button" data-lk-open="drawer-end-${u}">Open from the end</button>
        <button type="button" class="lk-button" data-lk-open="drawer-start-${u}">Open from the start</button>
      </p>
      <lk-drawer id="drawer-end-${u}" heading="Details"><p>A drawer holds supporting content without taking over the page. Escape, the close button or a click outside closes it.</p></lk-drawer>
      <lk-drawer id="drawer-start-${u}" heading="Filters" side="start">
        <lk-choices legend="Level"><label><input type="checkbox" /> Level 1</label><label><input type="checkbox" /> Level 2</label></lk-choices>
        <div class="lk-modal__actions"><button type="button" class="lk-button" data-variant="primary" data-lk-close="apply">Apply</button></div>
      </lk-drawer>`,
  },
  {
    id: 'lk-flow',
    title: 'Process chart and decision tree',
    html: () => `
      <lk-flow label="Handling a late submission" walkthrough>
        <ol>
          <li data-type="start">Work arrives after the deadline</li>
          <li>Was an extension agreed?
            <ul>
              <li data-label="Yes">Mark it as normal</li>
              <li data-label="No">Is there a good reason?
                <ul>
                  <li data-label="Yes">Offer a short extension</li>
                  <li data-label="No">Apply the late penalty</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>Record the outcome</li>
          <li data-type="end">Return feedback</li>
        </ol>
      </lk-flow>
      <p></p>
      <lk-flow label="Which tool should I use?" layout="tree" walkthrough>
        <ul>
          <li>Does the content need to behave differently for each learner?
            <ul>
              <li data-label="No">Is it mostly text and images?
                <ul>
                  <li data-label="Yes">Use Rise</li>
                  <li data-label="No">Use Storyline</li>
                </ul>
              </li>
              <li data-label="Yes">Build it with code</li>
            </ul>
          </li>
        </ul>
      </lk-flow>`,
  },
  {
    id: 'lk-guide',
    title: 'About this page panel',
    html: () => `
      <details class="lk-guide" open>
        <summary>About this page</summary>
        <div class="lk-guide__body">
          <p><strong>What this is.</strong> One or two plain sentences about the page.</p>
          <p class="lk-guide__title">What you can do here</p>
          <ul><li>A short list of things to try.</li><li>Start each with a verb.</li></ul>
        </div>
      </details>`,
  },
];
