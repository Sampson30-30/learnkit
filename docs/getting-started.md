# Getting started

## 1. Add the files

Copy `src/` into your project, or reference the files directly:

```html
<link rel="stylesheet" href="/learnkit/learnkit.css" />
<script type="module" src="/learnkit/index.js"></script>
```

To load only what you need, import individual components:

```html
<script type="module" src="/learnkit/lk-tabs.js"></script>
```

## 2. Write markup

```html
<lk-tabs label="Course sections" selected="1">
  <div data-lk-tab="Overview">...</div>
  <div data-lk-tab="Details">...</div>
</lk-tabs>
```

## 3. Listen for events

Every component emits bubbling events prefixed with `lk-`, so you can track learner progress:

```js
document.addEventListener('lk-tabchange', (event) => {
  console.log(event.detail.index, event.detail.title);
});
```

## Components

### `<lk-tabs>`

| Attribute | Description |
| --- | --- |
| `selected` | Zero-based index of the initially selected tab. Default `0`. |
| `label` | Accessible name for the tab list. |

| Event | Detail |
| --- | --- |
| `lk-tabchange` | `{ index, title }` |

Keyboard: Left and Right arrows move between tabs, Home and End jump to the first and last.

Markup inside `<lk-tabs>` is plain HTML. Without JavaScript, all panels are simply visible in order.


### `<lk-accordion>`

```html
<lk-accordion label="Course topics">
  <div data-lk-item="What you will learn" open>...</div>
  <div data-lk-item="How it is assessed">...</div>
</lk-accordion>
```

| Attribute | Description |
| --- | --- |
| `multiple` | Allow several sections to be open at once. Without it, opening one closes the others. |
| `level` | Heading level for the section headings, 1 to 6. Default `3`. Pick the level that fits the page outline. |
| `label` | Accessible name for the group. |
| `open` (on a section) | Start that section expanded. |

| Event | Detail |
| --- | --- |
| `lk-toggle` | `{ index, title, open }`. In single mode a section that closes because another opened also fires its own event. |

Methods: `toggle(index)`, `open(index)`, `close(index)`, and the read-only `openIndexes`.

Keyboard: Enter and Space open or close the focused section. Up and Down arrows move between headings, Home and End jump to the first and last.

Without JavaScript, every section is simply visible in order.


### `<lk-modal>`

```html
<button type="button" data-lk-open="course-modal">Course details</button>

<lk-modal id="course-modal" heading="Course details">
  <p>Content goes here.</p>
  <div class="lk-modal__actions">
    <button type="button" data-lk-close="ok">Got it</button>
  </div>
</lk-modal>
```

It uses a native `<dialog>` opened with `showModal()`, so the browser handles the top layer, keeps focus inside and makes the page behind inert.

| Attribute | Description |
| --- | --- |
| `heading` | Visible title. It is also the dialog's accessible name. |
| `label` | Accessible name to use when there is no visible heading. |
| `level` | Heading level for the title, 1 to 6. Default `2`. |
| `static` | Do not close on a backdrop click. Use it for tasks that must be finished or dismissed. Escape and the close button still work. |
| `close-label` | Accessible name for the close button. Default `Close`. |

| Event | Detail |
| --- | --- |
| `lk-open` | `{}` |
| `lk-close` | `{ returnValue }`. `"close"` for the close button, `"dismiss"` for a backdrop click, `"cancel"` for Escape, or the value of the `data-lk-close` button used. |

Open it with any element that has `data-lk-open="<id>"`, or in script with `modal.show()`. Close it with `modal.close(value)` or any element inside with `data-lk-close`. Read the state with `modal.isOpen`.

Keyboard: Escape closes. Tab and Shift+Tab stay inside the modal. Focus starts on the close button, or on any element inside that has `autofocus`, and returns to the element that opened the modal when it closes. Put `autofocus` on the safest button of a destructive confirmation.

The modal's content is hidden until the script loads, so the trigger needs JavaScript. For content that must work without it, use a normal link to a page instead.


### Buttons and badges

These are plain CSS classes, so they work on any element and need no JavaScript.

```html
<button type="button" class="lk-button" data-variant="primary">Save changes</button>
<a href="/help" class="lk-button" data-variant="link">Read the guide</a>
<span class="lk-badge" data-tone="success">Complete</span>
```

| Class | Options |
| --- | --- |
| `lk-button` | `data-variant`: `primary`, `danger`, `link`. `data-size="small"`. Use a real `disabled` attribute on buttons. |
| `lk-badge` | `data-tone`: `primary`, `success`, `warning`, `danger`, `info`. |

Buttons are at least 40px high. Badges must contain text, so meaning never depends on colour alone. Use one primary button per view, and name buttons with verbs that say what happens.


### `<lk-field>`

Adds a label, hint and error to a native `input`, `select` or `textarea`, and wires up the ARIA.

```html
<lk-field label="Email address" hint="We will only use this to reply to your message">
  <input name="email" type="email" required />
</lk-field>
```

| Attribute | Description |
| --- | --- |
| `label` | Visible label. Always provide one: never use a placeholder as a label. |
| `hint` | Help text under the label. |
| `error` | Error message from your own validation. Remove the attribute to clear it. |

The control's own rules (`required`, `type="email"`, `pattern`, `min` and so on) are checked when it loses focus, and again while typing once a message is showing. Call `field.validate()` to check on demand, for example on submit; it returns `true` or `false`. A `required` control gets a visible "(required)" marker. Error messages begin with the word "Error:", so they never rely on colour. A `type="range"` control shows its current value.

### `<lk-choices>`

Groups checkboxes or radio buttons into a `fieldset` with a legend.

```html
<lk-choices legend="Topics of interest" hint="Choose at least two" min="2">
  <label><input type="checkbox" name="topic" value="a" /> Assessment</label>
  <label><input type="checkbox" name="topic" value="b" /> Feedback</label>
</lk-choices>
```

| Attribute | Description |
| --- | --- |
| `legend` | Visible group label. |
| `hint` | Help text. |
| `error` | Error message from your own validation. |
| `min` | Minimum checked boxes in a checkbox group. |

Radio groups use the native `required` attribute on their inputs. Call `group.validate()` to check on demand.


### `<lk-progress>`

```html
<lk-progress label="Course progress" value="40" show-value></lk-progress>
```

| Attribute | Description |
| --- | --- |
| `value` | Current value. Leave it out for an indeterminate bar. Change it at any time. |
| `max` | Maximum value. Default `100`. |
| `label` | Accessible name. Always provide one. |
| `show-value` | Also show the percentage as text. |

### `<lk-stepper>`

Shows where the learner is in a sequence. It does not hold the step content. For content that changes step by step, use `<lk-process>`.

```html
<lk-stepper current="1" label="Enrolment steps">
  <ol>
    <li>Your details</li>
    <li>Choose a course</li>
    <li>Confirm</li>
  </ol>
</lk-stepper>
```

| Attribute | Description |
| --- | --- |
| `current` | Zero-based index of the current step. Steps before it show as complete. Also settable as `stepper.current = 2`. |
| `label` | Accessible name for the list. |
| `compact` | Show only the current step’s label. Added automatically when there are more than five steps. |

The current step has `aria-current="step"`, and each step carries a hidden "(completed)" or "(current step)" note for screen readers. On narrow screens the steps stack vertically.


### `<lk-tooltip>`

A short hint for a focusable element.

```html
<button id="help" class="lk-button">Help</button>
<lk-tooltip for="help">Opens the course guide</lk-tooltip>
```

| Attribute | Description |
| --- | --- |
| `for` | Id of the target. Without it, the previous sibling is used. |
| `placement` | `top` (default), `bottom`, `left` or `right`. It flips when there is no room. |

It opens on hover and keyboard focus, stays open while the pointer is over it, and closes on Escape. The target gets `aria-describedby`. Keep tooltips short and never put essential information only in one: touch users cannot hover. Methods: `show()` and `hide()`.

### `<lk-popover>`

A small panel next to a trigger that can hold links, buttons and form controls.

```html
<button class="lk-button" data-lk-popover="info">More about this</button>
<lk-popover id="info" label="About this topic">
  <p>Extra detail with a <a href="/guide">link</a>.</p>
</lk-popover>
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name. Always provide one. |
| `placement` | `bottom` (default), `top`, `left` or `right`. |

| Event | Detail |
| --- | --- |
| `lk-open`, `lk-close` | `{}` |

Opens and closes from the trigger. Escape closes it and returns focus to the trigger. A click outside, or moving focus out, also closes it. Focus moves to the first focusable element inside when it opens. Methods: `show(trigger)`, `hide()`, `toggle(trigger)`. Use `<lk-modal>` instead when the learner must deal with the content before going on.

Both use the browser's top layer (the Popover API), so they are never clipped by a scrolling parent, and fall back to fixed positioning in older browsers.


### Toast notifications

```js
import { toast } from 'learnkit';

toast('Progress saved', { tone: 'success' });
toast('Course deleted', { tone: 'danger', action: { label: 'Undo', onClick: restore } });
```

`toast(message, options)` shows a notification and returns `{ id, element, dismiss() }`. The `<lk-toasts>` region is created for you. Add `<lk-toasts placement="top-end">` yourself to choose the corner (`top-start`, `top-end`, `bottom-start`, `bottom-end`; default `bottom-end`), or to place it inside a themed wrapper.

| Option | Description |
| --- | --- |
| `tone` | `info` (default), `success`, `warning` or `danger`. Each starts with a word: Note, Done, Warning, Error. |
| `duration` | Milliseconds before it goes away. Default scales with the message length (about 4 seconds plus 60ms a character, up to 15). `0` keeps it until dismissed. `danger` toasts stay until dismissed. |
| `action` | `{ label, onClick }` adds a button, such as Undo. It dismisses the toast. |

Messages are plain text. Warnings and errors are announced immediately to screen readers; others politely. A toast pauses while the pointer or focus is on it, and every toast has a dismiss button. Use toasts for confirmations, never for information the learner must act on. The region fires `lk-dismiss` with `{ id, reason }`, where reason is `timeout`, `user`, `action` or `api`.


### `<lk-quiz>`

A knowledge check. One question at a time, instant feedback, then a score and a retry.

```html
<lk-quiz label="Check your understanding" title="Formative assessment">
  <div data-lk-question="Which of these is formative assessment?">
    <div data-lk-option correct data-feedback="Yes: it informs the next lesson.">A quick quiz in class</div>
    <div data-lk-option>A final exam</div>
    <p data-lk-explanation>Formative assessment happens during learning, to guide teaching.</p>
  </div>
</lk-quiz>
```

Mark more than one option `correct` to make a "choose all that apply" question. The same quiz as JSON, in a child script or through the `data` property:

```html
<lk-quiz label="Check">
  <script type="application/json">
    { "title": "Quick check",
      "questions": [
        { "prompt": "Pick one", "options": ["A", "B", "C"], "answer": 1, "explanation": "Because." },
        { "prompt": "Pick two", "options": [
            { "text": "A", "correct": true, "feedback": "Yes." }, "B", { "text": "C", "correct": true } ] }
      ] }
  </script>
</lk-quiz>
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name. |
| `title` | Visible title (the JSON `title` is used if this is missing). |
| `level` | Heading level for the title and results. Default `2`. |
| `shuffle` | Shuffle option order on each attempt. |

| Event | Detail |
| --- | --- |
| `lk-answer` | `{ id, index, correct, selected }` after each question is checked |
| `lk-complete` | `{ correct, total, percent, points }` when the results show. `points` gives partial credit on multiple-answer questions. |

Methods: `reset()` restarts the quiz, and `quiz.data = {...}` replaces the questions. A question with no prompt, fewer than two options or no correct option is skipped, and the quiz explains that it could not be shown if nothing usable is left. Feedback always uses words ("Correct", "Incorrect", "Correct answer"), never colour alone.


### `<lk-journal>`

A reflection journal. Each prompt gets a text box. Notes are saved in this browser as the learner types, and can be copied or downloaded.

```html
<lk-journal name="week-1" title="Week 1 reflection">
  <div data-lk-prompt="What went well this week?" data-hint="Think about one lesson."></div>
  <div data-lk-prompt="What would you change next time?"></div>
</lk-journal>
```

| Attribute | Description |
| --- | --- |
| `name` | Storage key. Without it, nothing is saved. Use a different name for each journal on your site. |
| `title` | Visible title, also used in exports. |
| `level` | Heading level for the title. Default `2`. |
| `rows` | Height of each box in rows. Default `5`. |

| Event | Detail |
| --- | --- |
| `lk-save` | `{ name, entries }` |
| `lk-export` | `{ format, filename }` where format is `copy`, `text` or `json` |

Methods and properties: `entries` (`[{ prompt, text }]`), `save()`, `export("text" | "json")` which returns `{ filename, mime, content }` without downloading, and `clear()`.

Saving uses `localStorage`, so notes stay on the learner's own device and browser. If storage is blocked (for example in a private window), the journal says so and the Download buttons are the way to keep the notes. The text export is Markdown, which also reads fine as plain text. "Clear all" asks for confirmation first.


### `<lk-spectrum>`

Asks the learner to place their view between two poles, then compares it with an expert position.

```html
<lk-spectrum statement="How should feedback be given?"
             left="Written" right="Spoken" expert="70"
             explanation="Spoken feedback allows a conversation, but write down the key points.">
</lk-spectrum>
```

| Attribute | Description |
| --- | --- |
| `statement` | The question or statement. |
| `left`, `right` | Labels for the two ends. |
| `expert` | Expert position from 0 (left) to 100 (right). Without it there is no comparison step. |
| `explanation` | Why the expert holds that position. |

| Event | Detail |
| --- | --- |
| `lk-change` | `{ value }` as the learner moves the slider |
| `lk-reveal` | `{ value, expert, difference }` when compared |

It is a native range input, so arrow keys, Home and End work, and the position is also announced in words ("Towards Spoken"). Comparing needs the learner to have moved the slider first. After comparing, the slider locks, and "Change my position" unlocks it. Read the position with `spectrum.value`; call `spectrum.reveal()` from your own code if you prefer.

### `<lk-rating>`

A self-assessment. The learner rates themselves on a scale for each statement.

```html
<lk-rating label="How confident are you with these skills?" scale="5"
           low="Not at all" high="Completely" summary name="skills-check">
  <div data-lk-statement="Planning a lesson"></div>
  <div data-lk-statement="Giving feedback"></div>
</lk-rating>
```

| Attribute | Description |
| --- | --- |
| `label` | Group name. With no statements inside, the label itself is rated. |
| `scale` | Number of points, 2 to 10. Default `5`. |
| `low`, `high` | Describe the lowest and highest points. Screen readers hear them on those options. |
| `summary` | Once every statement is rated, show the average and the statements rated in the lower half, as "You might focus on". |
| `name` | Storage key. If set, ratings are remembered in this browser. |

| Event | Detail |
| --- | --- |
| `lk-rate` | `{ index, statement, value }` |
| `lk-summary` | `{ total, answered, complete, average, focus }` when every statement is rated (`focus` lists statements) |

Each statement is a radio group, so arrow keys move between points. `ratings` returns the current values and `reset()` clears them.


### `<lk-timeline>`

Events in order, each a child marked with `data-lk-date`.

```html
<lk-timeline label="History of the college" collapsible>
  <div data-lk-date="1962" data-title="Founded">The first classes began...</div>
  <div data-lk-date="1990" data-title="New campus">...</div>
</lk-timeline>
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name for the list. |
| `level` | Heading level for event titles. Default `3`. |
| `collapsible` | Event details open and close when the title is pressed. |
| `stepped` | Show one event at a time, with a "Show next event" button. |

Events: `lk-toggle` `{ index, title, open }` (collapsible) and `lk-reveal` `{ index, date, title, remaining }` (stepped). It is an ordered list, so the order is available to assistive technology. `revealNext()` reveals the next event from your own code.

### `<lk-grid-explorer>`

A grid of tiles. Choosing a tile shows its details below and ticks it off.

```html
<lk-grid-explorer label="Learning theories" columns="3">
  <div data-lk-cell="Behaviourism">Learning as a change in behaviour...</div>
  <div data-lk-cell="Constructivism">Learners build knowledge...</div>
</lk-grid-explorer>
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name for the grid. |
| `columns` | Columns on wide screens, 1 to 6. Default `3`. Narrow screens use fewer. |
| `level` | Heading level for the detail title. Default `3`. |

| Event | Detail |
| --- | --- |
| `lk-explore` | `{ index, title, explored, total }` |
| `lk-complete` | `{ explored, total }` when every tile has been opened |

Arrow keys, Home and End move between tiles in the grid's layout. Choosing the open tile again closes it. After choosing, focus moves to the details; Escape returns to the tile. Explored tiles carry a tick and a hidden "(explored)" note.

### `<lk-process>`

Walks the learner through steps one at a time, with a stepper showing where they are.

```html
<lk-process label="Planning a lesson">
  <div data-lk-step="Set the outcome">Decide what learners will be able to do...</div>
  <div data-lk-step="Plan the activities">...</div>
</lk-process>
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name. |
| `level` | Heading level for step titles. Default `3`. |

Events: `lk-step` `{ index, title }` on every change, and `lk-complete` `{ steps }` when the learner finishes the last step. Moving between steps moves focus to the step's title. `go(index)` jumps to a step and `current` reads the index. Without JavaScript every step is shown in order.

### `<lk-scenario>`

A branching story: read a situation, choose what to do, see where it leads.

```html
<lk-scenario label="A late submission" start="start">
  <div data-lk-node="start" data-title="An email arrives">
    <p>A learner asks for more time...</p>
    <ul data-lk-choices>
      <li data-lk-goto="strict">Say no</li>
      <li data-lk-goto="flex">Agree an extension</li>
    </ul>
  </div>
  <div data-lk-node="strict" data-end data-outcome="poor" data-title="The learner disengages">...</div>
  <div data-lk-node="flex" data-end data-outcome="good" data-title="The learner catches up">...</div>
</lk-scenario>
```

A node with no choices is an ending. `data-outcome` can be `good`, `mixed` or `poor` and shows a labelled badge ("Best outcome", "Mixed outcome", "Poor outcome"). The same scenario as JSON, in a child `<script type="application/json">` or through the `data` property:

```json
{ "start": "a",
  "nodes": {
    "a": { "title": "An email arrives", "text": "A learner asks for more time.",
           "choices": [ { "text": "Say no", "goto": "b" }, { "text": "Agree an extension", "goto": "c" } ] },
    "b": { "text": "They disengage.", "end": true, "outcome": "poor" },
    "c": { "text": "They catch up.", "end": true, "outcome": "good" } } }
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name. |
| `start` | Id of the first node. Default: the first node. |
| `level` | Heading level for node titles. Default `3`. |

| Event | Detail |
| --- | --- |
| `lk-choose` | `{ from, to, choice, path }` |
| `lk-end` | `{ node, outcome, path }` where `path` lists the choices made |

Choices that point to a missing node are dropped and unreachable nodes are reported by the parser, so a mistake in a long scenario does not break it. "Go back one step" and "Start again" are always available after the first choice, and the ending lists the learner's choices. Methods: `restart()`; `path` reads the choices so far.

## Display components

### `<lk-table>`

Makes a native table sortable and filterable. The table stays ordinary HTML, so it still reads well without JavaScript.

```html
<lk-table label="Courses this term" sortable filter striped>
  <table>
    <caption>Courses this term</caption>
    <thead><tr><th>Course</th><th>Hours</th></tr></thead>
    <tbody>
      <tr><td>Mathematics</td><td>30</td></tr>
      <tr><td>English</td><td>100</td></tr>
    </tbody>
  </table>
</lk-table>
```

| Attribute | Description |
| --- | --- |
| `label` | Accessible name for the scrolling region. Always provide one. |
| `sortable` | Headers become sort buttons with `aria-sort`. Put `data-nosort` on a `<th>` to skip it. |
| `filter` | Adds a search box. A row shows when it contains every typed word. |
| `striped` | Shades alternate rows. |

A column sorts as numbers when every value is a number (including `£`, `%` and commas), otherwise as text with natural ordering (`b2` before `b10`). Add `data-type="number"` or `"text"` to a `<th>` to force it, and `data-value` to a cell to sort by something other than its text, such as an ISO date. Clicking a header again reverses the order, and a third click restores the original. A status line (`Showing 2 of 5 rows, sorted by Hours, ascending`) is announced to screen readers. Events: `lk-sort` `{ column, direction }` and `lk-filter` `{ query, shown, total }`. Call `table.sortBy(columnIndex)` to sort from code.

### `<lk-alert>`

```html
<lk-alert tone="warning" heading="Deadline moved" dismissible>Submit by Friday instead.</lk-alert>
```

`tone` is `info` (default), `success`, `warning` or `danger`. A visually hidden word ("Warning:") is added so meaning never relies on colour. Alerts are silent by default; add `live` to one you insert after the page has loaded and it is announced (`alert` for warning and danger, `status` otherwise). `dismissible` adds a close button, fires `lk-dismiss` and removes the alert.

### `<lk-chip>`

```html
<lk-chip>Level 2</lk-chip>
<lk-chip selectable selected>Maths</lk-chip>
<lk-chip removable tone="info">Evening</lk-chip>
```

A selectable chip is a toggle button (`aria-pressed`) and fires `lk-select` `{ selected }`. A removable chip has a button named "Remove Evening", fires `lk-remove` `{ label }`, then removes itself. Tones are `primary`, `success`, `warning`, `danger` and `info`.

### `<lk-avatar>`

```html
<lk-avatar name="Ada Lovelace"></lk-avatar>
<lk-avatar name="Grace Hopper" src="grace.jpg" size="lg"></lk-avatar>
```

Shows a picture, or the person's initials if there is none or it fails to load. The colour comes from the name, so it is stable; set `tone` to fix it. `size` is `sm`, `md` or `lg`. Add `decorative` when the name is written next to it. Wrap several in `<span class="lk-avatar-group">` to overlap them.

### `<lk-switch>`

```html
<lk-switch label="Email reminders" hint="One a week" name="reminders" checked></lk-switch>
```

A native checkbox with `role="switch"`, so it works in forms. Read or set `.checked`; `lk-change` `{ checked }` fires on change.

### `<lk-breadcrumbs>`

```html
<lk-breadcrumbs label="You are here" max="4">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/courses">Courses</a></li>
    <li>Mathematics</li>
  </ol>
</lk-breadcrumbs>
```

The last item is marked `aria-current="page"`. With `max`, the middle of a long trail collapses behind a button that reveals it.

### `<lk-pagination>`

```html
<lk-pagination label="Results" total="12" page="1"></lk-pagination>
```

Shows the first, last and current pages with one either side (`siblings` changes that). Fires `lk-pagechange` `{ page }`; it does not load content, so listen for the event and show the right page. Focus stays on the button used, and the new page is announced.

### Cards, dividers and skeletons

CSS only, no script.

```html
<div class="lk-card"><h3>Title</h3><p>Content</p><div class="lk-card__footer">Actions</div></div>
<hr class="lk-divider" />
<div aria-busy="true">
  <span class="lk-skeleton" aria-hidden="true" style="width: 60%"></span>
  <span class="lk-skeleton" data-variant="circle" aria-hidden="true"></span>
</div>
```

Skeleton variants are the default text line, `circle` and `block`. Hide skeletons from screen readers and set `aria-busy` on the region that is loading.

## More learning components

### `<lk-flashcards>`

Recall practice. The learner reads the front, tries to remember, reveals the back, then says whether they knew it. Cards they did not know come round again until every card is known, then a summary offers to practise only the ones they missed.

```html
<lk-flashcards label="Key terms" shuffle>
  <div data-lk-card="Formative assessment">Assessment <strong>during</strong> learning.</div>
  <div data-lk-card="Summative assessment">Assessment at the <strong>end</strong>.</div>
</lk-flashcards>
```

The value of `data-lk-card` is the front (plain text); the element's content is the back and may contain markup. `shuffle` randomises the order. Focus moves to the next action after each step, and answers are announced. Events: `lk-reveal` `{ index }`, `lk-cardanswer` `{ index, known }`, `lk-deckcomplete` `{ total, firstTime }`. Methods: `restart()` and `practiseMissed()`.

### `<lk-order>`

The learner puts items in sequence. **Write the items in the correct order**; they are shuffled for the learner (and never start solved).

```html
<lk-order label="Put the writing process in order">
  <ol><li>Plan</li><li>Draft</li><li>Revise</li><li>Publish</li></ol>
</lk-order>
```

Every item has named Move up and Move down buttons, so it works by keyboard, screen reader and touch; each move is announced ("Plan moved to position 2 of 4") and focus follows the item. Pointer users can also drag. "Check order" marks each item right or wrong **in words as well as symbols**, and moving anything clears the marks. Events: `lk-orderchange` `{ order, labels }`, `lk-check` `{ score, total, complete }`. `el.sequence` reads the current order as text.

### `<lk-matrix>`

A table the learner completes. It starts as an ordinary table, so it still reads without JavaScript. Mark the cells to complete in the markup.

```html
<lk-matrix label="Complete the table" show-answers>
  <table>
    <caption>Learning theories</caption>
    <thead><tr><th>Theory</th><th>Main idea</th><th>Learner is active</th></tr></thead>
    <tbody>
      <tr><th>Behaviourism</th><td data-answer="Habits|Behaviour">Behaviour</td><td data-tick="no"></td></tr>
      <tr><th>Constructivism</th><td data-answer="Meaning">Meaning</td><td data-tick="yes"></td></tr>
    </tbody>
  </table>
</lk-matrix>
```

`data-answer` makes a text box. Separate accepted answers with `|`; capitals and spare spaces are ignored. `data-tick="yes"` makes a tick box that should be ticked, and `data-tick="no"` one that should be left empty. Each box is named by its row and column headings (for example "Behaviourism, Main idea"). "Check answers" marks every box **in words as well as colour** (Right, Not quite, Empty), and changing a box clears its mark. Add `show-answers` for a "Show answers" button that appears after a check. Events: `lk-check` `{ score, total, complete }`, `lk-reveal`. Methods: `check()`, `reset()`, `reveal()`. `el.values` reads what the learner has entered.

### `<lk-glossary>`

Terms and their meanings, for one page. Write a plain list in any order; the component sorts it A to Z.

```html
<lk-glossary label="Assessment terms">
  <dl>
    <dt>Summative assessment</dt><dd>Judging what has been learned at the end.</dd>
    <dt>Formative assessment</dt><dd>Checking progress during learning, to help it along.</dd>
  </dl>
</lk-glossary>
```

A search box looks at terms and meanings. Jump links appear for each letter that has terms, and choosing one moves focus to that letter's heading. A term may have several meanings: follow its `<dt>` with more than one `<dd>`. `level` sets the heading level for the letters (1 to 6, default 3). The result count is announced to screen readers. Event: `lk-filter` `{ query, shown, total }`. Method: `filter(query)`.

### `<lk-hotspot>`

Numbered points on a picture or diagram. Choosing a point shows its explanation, and the component tracks what has been explored.

```html
<lk-hotspot label="Parts of a plant">
  <img src="plant.png" alt="A plant with a flower, stem and roots" />
  <div data-lk-spot data-x="50" data-y="15" data-title="Flower">Makes seeds.</div>
  <div data-lk-spot data-x="48" data-y="60" data-title="Stem">Carries water.</div>
</lk-hotspot>
```

The first child that is not a spot is the picture: an `<img>`, an inline `<svg>` or anything else, with its own alt text. `data-x` and `data-y` are percentages from the top left. Each point is a real button in the order written, named by its title (and "(explored)" once visited), so the picture is never the only way in. Events: `lk-spot` `{ index, title }` and a single `lk-allexplored` `{ total }`. `el.select(index)` chooses a point from code.

## Navigation components

### `<lk-menu>`

A button that opens a list of actions or links.

```html
<lk-menu label="More actions">
  <button data-lk-item value="duplicate">Duplicate</button>
  <a data-lk-item href="/export">Export</a>
  <hr />
  <button data-lk-item value="archive" disabled>Archive</button>
</lk-menu>
```

| Attribute | Description |
| --- | --- |
| `label` | Text on the trigger button. |
| `variant` | Optional button variant for the trigger: `primary`, `danger` or `link`. |

Enter, Space or Down opens it on the first item; Up opens it on the last. Inside, arrows move and wrap, Home and End jump, typing a letter jumps to a matching item, Escape closes and returns focus to the trigger, and Tab closes. Disabled items are skipped. The panel sits in the top layer, so no parent can clip it, and it flips above the trigger when there is no room below. Choosing a button item fires `lk-select` `{ label, value }`; links follow their `href`. Also `lk-open` and `lk-close`. Use it for actions; for moving between pages a plain list of links is usually clearer.

### `<lk-tree>`

Nested content that opens and closes, such as a course outline. Write nested lists.

```html
<lk-tree label="Course contents">
  <ul>
    <li open>Unit 1
      <ul>
        <li><a href="#a">Lesson A</a></li>
        <li data-value="b">Lesson B</li>
      </ul>
    </li>
    <li>Unit 2<ul><li>Lesson C</li></ul></li>
  </ul>
</lk-tree>
```

On an item, `open` starts a branch expanded and `data-value` is reported with the choice. The whole tree is one tab stop. Up and Down move, Right opens a branch then moves into it, Left closes it then moves to the parent, Home and End jump, `*` opens every branch at that level, Enter or Space chooses, and typing jumps to a match. Choosing an item marks it `aria-selected` and fires `lk-select` `{ label, value, path }`; choosing a branch also toggles it (`lk-toggle` `{ label, open }`); an item that contains a link follows it. Methods: `expandAll()`, `collapseAll()`, `select(index)`, and `selectedLabel`.

### `<lk-drawer>`

A panel that slides in from the side for navigation, filters or details. It is a modal dialog underneath, so focus stays inside, the page behind is inert, and Escape or a click outside closes it.

```html
<button data-lk-open="filters">Filters</button>
<lk-drawer id="filters" heading="Filter courses" side="start">...</lk-drawer>
```

It takes every attribute, method and event of `<lk-modal>` (including `data-lk-open` and `data-lk-close`), plus `side` (`start` or `end`, default `end`; it follows the reading direction). Set `--lk-drawer-width` to change the width (default `24rem`, never wider than the screen). The slide-in is skipped when the user prefers reduced motion.

## Diagrams

### `<lk-flow>`

A process chart or a decision tree, drawn from nested lists, with an optional walk-through that asks one question at a time and highlights the route on the chart.

```html
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
```

**Writing it**

| Markup | Meaning |
| --- | --- |
| `<ol>` | Steps, in order. |
| `<ul>` inside an `<li>` | Branches. The item becomes a decision and each branch `<li>` is one answer. |
| `data-label` on a branch | The answer, shown on the connector ("Yes"). |
| `<ol>` inside a branch `<li>` | More steps in that branch, after the first. |
| `data-type` | `start`, `end`, `step` or `decision`. A decision is the default for an item with branches. |
| `data-detail` | Longer wording for an item, kept out of the chart so the boxes stay small. Plain text. With a walk-through it appears in the panel when the learner arrives; without one it appears under the item's title. |

Branches rejoin whatever follows the decision, however deeply they are nested. A branch that finishes in an `end` stops there instead.

| Attribute | Description |
| --- | --- |
| `label` | Accessible name. Always provide one. |
| `layout` | `process` (default) or `tree`. A tree never rejoins: every branch ends in a result, and anything written after a decision is ignored with a console warning. |
| `walkthrough` | Adds a panel. Each step shows its question and one button per answer, with Back and Start again, and the route so far. |

**Accessibility.** The chart is real nested lists, not a picture. A screen reader hears "Start:", "Decision:", "End:" and "If Yes" in words, and the lines and arrows are decoration. The chart scrolls sideways inside its own labelled region when it is wider than the page, so it never forces the page to scroll. Walk-through steps are announced, focus moves to the next answer, and nothing takes focus on load.

Events: `lk-flowstep` `{ id, text, route }` and `lk-flowend` `{ route }`. Methods: `restart()` and `back()`; `route` reads the route so far.

Use `<lk-process>` instead when each step has its own content to read. Use `<lk-scenario>` when the choices lead to story passages and outcomes rather than a short answer.

## Helper text

### `.lk-guide`

A plain-English "About this page" panel. It is CSS only, built on a native `<details>`, so it needs no script, opens and closes with the keyboard, and still reads well without any styling.

```html
<details class="lk-guide" open>
  <summary>About this page</summary>
  <div class="lk-guide__body">
    <p><strong>What this is.</strong> One or two plain sentences.</p>
    <p class="lk-guide__title">What you can do here</p>
    <ul><li>Try the first thing.</li><li>Then the next.</li></ul>
  </div>
</details>
```

Write it for someone with no developer background: say what the page is, then what they can do on it, starting each item with a verb. Avoid words like framework, dependency, markup or build step. If a technical word cannot be avoided, say what it means in the same sentence. Put the panel straight after the page's main heading, open by default so a first-time visitor sees it, and keep it short enough that a returning visitor can close it and carry on.
