// Builds the machine-readable description of LearnKit from the doc comments in src/.
//   npm run manifest          rewrite custom-elements.json and llms.txt
//   npm run manifest:check    fail if either is out of date (nothing is written)
//
// custom-elements.json follows the Custom Elements Manifest shape, with an
// extra `examples` list per element. llms.txt is the same information as one
// page of plain text, for pasting into (or fetching from) an AI assistant.
// The doc comment above each component is the single source: edit that, then
// run this. Nothing here is loaded by the components themselves.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');
const OUT_JSON = resolve(ROOT, 'custom-elements.json');
const OUT_TEXT = resolve(ROOT, 'llms.txt');

const DEFINE = /^define\('(lk-[\w-]+)',\s*(\w+)\)/gm;
const COMMENT = /\/\*\*([\s\S]*?)\*\//g;

/** The text of a doc comment, without the leading asterisks. */
const unwrap = (body) => body.split('\n').map((line) => line.replace(/^\s*\*? ?/, '').replace(/\s+$/, ''));

/** Rows of `name  description` under a heading, with wrapped lines joined. */
function rows(lines, start) {
  const out = [];
  let indent = null;
  for (let i = start; i < lines.length && lines[i] !== ''; i++) {
    const own = lines[i].match(/^(\s+)/)?.[1].length ?? 0;
    const row = lines[i].match(/^(\s+)([a-z][\w-]*)\s{2,}(\S.*)$/);
    if (row && (indent === null || own === indent)) {
      indent = own;
      out.push({ name: row[2], description: row[3] });
    } else if (out.length && own > (indent ?? 0)) {
      out.at(-1).description += ' ' + lines[i].trim();
    }
  }
  return out;
}

/** Attributes written on one line: "Attributes: label (required), hint, name." */
function inline(lines) {
  const line = lines.find((l) => /^Attributes?:\s*\S/.test(l));
  if (!line) return [];
  return line
    .replace(/^Attributes?:\s*/, '')
    .replace(/\.$/, '')
    .split(',')
    .map((part) => part.trim().match(/^([a-z][\w-]*)(?:\s*\((.*)\))?$/))
    .filter(Boolean)
    .map((m) => ({ name: m[1], description: m[2] ? m[2][0].toUpperCase() + m[2].slice(1) + '.' : '' }));
}

/** Event names with their detail shape, from an "Events:" line or block. */
function events(lines) {
  const at = lines.findIndex((l) => /^Events?:/.test(l));
  let text = '';
  if (at >= 0) {
    text = lines[at].replace(/^Events?:/, '');
    for (let i = at + 1; i < lines.length && lines[i] !== ''; i++) text += ' ' + lines[i];
  }
  for (const line of lines) if (/\bFires\s+lk-/.test(line)) text += ' ' + line.replace(/^.*?\bFires\s+/, '');
  return [...text.matchAll(/\b(lk-[a-z]+)\b\s*(?:detail:\s*)?(\{[^}]*\})?/g)].map((m) => ({
    name: m[1],
    detail: m[2] ?? '{}',
  }));
}

/** Indented markup blocks that use the element, as written in the comment. */
function examples(lines, tag) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s+</.test(lines[i])) continue;
    const block = [];
    for (; i < lines.length && lines[i] !== ''; i++) block.push(lines[i]);
    const indent = Math.min(...block.map((l) => l.match(/^\s*/)[0].length));
    const text = block.map((l) => l.slice(indent)).join('\n');
    if (text.includes('<' + tag)) out.push(text);
  }
  return out;
}

/** Everything the doc comment says about one element. */
function describe(tag, lines) {
  const head = lines.findIndex((l) => /^(Attributes?:|.*\badds:)$/.test(l));
  const intro = [];
  for (const line of lines) {
    if (line === '' && intro.length) break;
    if (line !== '') intro.push(line.trim());
  }
  return {
    description: intro.join(' '),
    attributes: head < 0 ? inline(lines) : rows(lines, head + 1),
    events: events(lines),
    examples: examples(lines, tag),
  };
}

/** Reads src/lk-*.js and returns the elements in source order. */
export function read() {
  const modules = [];
  for (const file of readdirSync(SRC).filter((f) => /^lk-.*\.js$/.test(f)).sort()) {
    const code = readFileSync(resolve(SRC, file), 'utf8');
    const documented = new Map();
    for (const [, body] of code.matchAll(COMMENT)) {
      const lines = unwrap(body).filter((_, i, all) => i > 0 || all[0] !== '');
      const tag = lines[0]?.match(/^<(lk-[\w-]+)>/)?.[1];
      if (tag && !documented.has(tag)) documented.set(tag, describe(tag, lines));
    }
    const declarations = [...code.matchAll(DEFINE)].map(([, tagName, name]) => ({
      kind: 'class',
      name,
      tagName,
      ...(documented.get(tagName) ?? { description: '', attributes: [], events: [], examples: [] }),
    }));
    if (declarations.length) modules.push({ kind: 'javascript-module', path: `src/${file}`, declarations });
  }
  return modules;
}

export function buildJson(modules = read()) {
  return JSON.stringify({ schemaVersion: '1.0.0', modules }, null, 2) + '\n';
}

export function buildText(modules = read()) {
  const { version } = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
  const themes = readdirSync(resolve(SRC, 'themes')).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4)).sort();
  const out = [
    `# LearnKit ${version}`,
    '',
    '> Dependency-free Web Components for accessible UI and interactive learning content. No framework and no build step: a stylesheet, a script, then HTML.',
    '',
    '## Rules for writing LearnKit HTML',
    '',
    '- Use only the elements, attributes and events listed below. If something is not listed, it does not exist.',
    '- Content goes in child elements marked with `data-lk-*` attributes (for example `data-lk-tab`, `data-lk-question`). The attribute value is the title or prompt.',
    '- Where an attribute says "Required", leave it out and the component is not accessible.',
    '- Write real, plain HTML inside. Do not add your own JavaScript to make a component work.',
    '- Give every `name` (journal, rating) a different value on each page of a site.',
    '',
    '## Install',
    '',
    '```html',
    '<link rel="stylesheet" href="learnkit.css" />',
    '<link rel="stylesheet" href="themes/clean.css" /> <!-- optional -->',
    '<script type="module" src="index.js"></script>',
    '```',
    '',
    `Themes: ${themes.join(', ')}.`,
    '',
    '## Elements',
  ];
  for (const { declarations } of modules) {
    for (const el of declarations) {
      out.push('', `### <${el.tagName}>`, '', el.description || '(no description yet)');
      if (el.attributes.length) {
        out.push('', 'Attributes:');
        for (const a of el.attributes) out.push(`- \`${a.name}\`${a.description ? `: ${a.description}` : ''}`);
      }
      if (el.events.length) {
        out.push('', 'Events:');
        for (const e of el.events) out.push(`- \`${e.name}\` ${e.detail === '{}' ? '' : `detail ${e.detail}`}`.trimEnd());
      }
      for (const example of el.examples) out.push('', 'Example:', '', '```html', example, '```');
    }
  }
  return out.join('\n') + '\n';
}

/** Writes both files, or only reports which are out of date. Returns the stale ones. */
export function generate({ check = false } = {}) {
  const modules = read();
  const files = [
    [OUT_JSON, buildJson(modules)],
    [OUT_TEXT, buildText(modules)],
  ];
  const stale = [];
  for (const [path, content] of files) {
    let current = null;
    try {
      current = readFileSync(path, 'utf8');
    } catch {}
    if (current === content) continue;
    stale.push(path.slice(ROOT.length + 1));
    if (!check) writeFileSync(path, content);
  }
  return stale;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  const stale = generate({ check });
  if (!stale.length) console.log('custom-elements.json and llms.txt are up to date.');
  else if (check) {
    console.error(`Out of date: ${stale.join(', ')}. Run npm run manifest.`);
    process.exitCode = 1;
  } else console.log(`Updated: ${stale.join(', ')}.`);
}
