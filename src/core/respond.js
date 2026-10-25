// DOM-free logic for <lk-respond>. `choices[i]` is the response chosen for case i,
// or null while it is unanswered. `cases[i].accepted` lists every response that
// counts as suitable for case i.

/** Records a choice for one case. Returns a new array. */
export function choose(choices, index, action) {
  if (index < 0 || index >= choices.length || choices[index] === action) return choices;
  const out = [...choices];
  out[index] = action;
  return out;
}

/** Marks each case 'correct', 'wrong' or 'unanswered'. */
export function checkResponses(choices, cases) {
  const marks = choices.map((action, i) => (action === null ? 'unanswered' : cases[i].accepted.includes(action) ? 'correct' : 'wrong'));
  const score = marks.filter((m) => m === 'correct').length;
  return { marks, score, unanswered: marks.filter((m) => m === 'unanswered').length, total: choices.length, complete: score === choices.length };
}

/** What is said straight after a response is chosen. */
export function chosenLead(action) {
  return `You chose ${action}.`;
}

/** The first line of a case's verdict, in words so colour is never the only signal. */
export function verdictLead(mark) {
  return mark === 'correct' ? 'Correct' : 'Not quite';
}

/** The sentence under the verdict. `accepted` lists the suitable responses. */
export function verdictDetail(mark, accepted) {
  return mark === 'correct' ? 'This is a suitable response.' : `A more suitable choice here: ${accepted.join(' or ')}.`;
}

/** Shown when the learner checks before answering every case. */
export function unansweredMessage(count) {
  return `Choose a response for each one before checking. ${count} ${count === 1 ? 'remains' : 'remain'} unanswered.`;
}

/** The line shown once every case has been checked. */
export function summaryMessage({ score, total }) {
  return `${score} of ${total} decisions matched a suitable response. Read the explanation under each one.`;
}
