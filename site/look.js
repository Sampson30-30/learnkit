// The look and mode of a whole page, chosen in the header and remembered between pages.
// DOM-free: the header (site-nav.js) applies the choice to the page.
//
// The looks come from gallery/demos.js, the same list the gallery and home page use,
// so a new theme appears in the header's menu as soon as it is listed there.
import { THEMES } from '../gallery/demos.js';

export const DEFAULT_LOOK = 'clean';

/** Every look the header offers. An empty id is the built-in look, with no theme file. */
export const LOOKS = THEMES.map((theme) => ({ id: theme.id, name: theme.id === 'blc' ? 'BLC' : theme.name }));

export const MODES = [
  { id: '', name: 'Automatic' },
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
];

const KEYS = { look: 'lk-site-look', mode: 'lk-site-mode' };

export const isLook = (value) => LOOKS.some((look) => look.id === value);
export const isMode = (value) => MODES.some((mode) => mode.id === value);

/** Reads from storage without ever throwing: some browsers refuse it, or have it switched off. */
function get(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** The saved choice. Anything missing, unknown or unreadable falls back to `fallbackLook` and "match my device". */
export function readChoice(storage, fallbackLook = DEFAULT_LOOK) {
  const look = get(storage, KEYS.look);
  const mode = get(storage, KEYS.mode);
  return {
    look: look !== null && isLook(look) ? look : fallbackLook,
    mode: mode !== null && isMode(mode) ? mode : '',
  };
}

/** Remembers a choice. Quietly does nothing if storage is not available. */
export function saveChoice(storage, { look, mode }) {
  try {
    storage?.setItem(KEYS.look, look);
    storage?.setItem(KEYS.mode, mode);
  } catch {
    // Not remembering is fine: the page still has the look the learner picked.
  }
}
