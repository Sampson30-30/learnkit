// Generates the colour tokens of the themes that come from a design system.
//
// The design system is the original. `design-systems/<theme>.tokens.json` is a
// copy of its tokens.json, `design-systems/<theme>.map.json` says which design
// system token feeds which --lk-* token, and the theme stylesheet holds the
// result between `BEGIN generated` and `END generated` markers.
//
// No dependencies. Used by scripts/sync-themes.mjs and by the tests.
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

export const THEMES = ['blc', 'howdigital'];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Loads a design system's colour tokens. */
export function loadDesignSystem(theme) {
  const json = JSON.parse(read(`design-systems/${theme}.tokens.json`));
  const modes = json.color.themes.map((t) => t.id);
  const byName = new Map(json.color.tokens.map((t) => [t.name, t]));
  return { name: json.name, modes, byName };
}

export function loadMap(theme) {
  return JSON.parse(read(`design-systems/${theme}.map.json`));
}

/** Resolves a design system colour for one mode, following {alias} references. */
export function resolve(ds, name, mode, seen = []) {
  const token = ds.byName.get(name);
  if (!token) throw new Error(`${ds.name} has no colour token "${name}"`);
  if (seen.includes(name)) throw new Error(`${ds.name}: alias cycle through "${name}"`);
  let value = token.value;
  if (value && typeof value === 'object') value = value[mode] ?? value[ds.modes[0]];
  const alias = /^\{(.+)\}$/.exec(value);
  if (alias) return resolve(ds, alias[1], mode, [...seen, name]);
  return HEX.test(value) ? value.toLowerCase() : value;
}

/** The [property, value] pairs for one theme and mode, in map order. */
export function declarations(theme, mode, ds = loadDesignSystem(theme), map = loadMap(theme)) {
  const out = [];
  for (const [prop, source] of Object.entries(map.tokens)) {
    if (typeof source === 'string' && source.startsWith('ds:')) {
      out.push([prop, resolve(ds, source.slice(3), mode)]);
    } else if (source && typeof source === 'object') {
      out.push([prop, source[mode]]);
    } else {
      throw new Error(`${theme}: ${prop} must be "ds:token" or { light, dark }`);
    }
  }
  if (mode === 'light') {
    for (const [prop, source] of Object.entries(map.extra || {})) out.push([prop, resolve(ds, source.replace(/^ds:/, ''), mode)]);
  }
  return out;
}

const MARKER = /^([ \t]*)\/\* BEGIN generated:(light|dark)[^\n]*\*\/\n[\s\S]*?^[ \t]*\/\* END generated \*\//gm;

/** Returns the theme stylesheet with its generated blocks rewritten. */
export function buildTheme(theme, css = read(`src/themes/${theme}.css`)) {
  const ds = loadDesignSystem(theme);
  const map = loadMap(theme);
  return css.replace(MARKER, (_all, indent, mode) => {
    const lines = declarations(theme, mode, ds, map).map(([p, v]) => `${indent}${p}: ${v};`);
    return [
      `${indent}/* BEGIN generated:${mode} from design-systems/${theme}.tokens.json. Edit that file or ${theme}.map.json, then run npm run sync. */`,
      ...lines,
      `${indent}/* END generated */`,
    ].join('\n');
  });
}

/** Rewrites the stylesheets. With check: true, writes nothing and lists the themes that are out of date. */
export function sync({ check = false } = {}) {
  const stale = [];
  for (const theme of THEMES) {
    const path = `src/themes/${theme}.css`;
    const current = read(path);
    const next = buildTheme(theme, current);
    if (next === current) continue;
    stale.push(theme);
    if (!check) writeFileSync(new URL(path, root), next);
  }
  return stale;
}
