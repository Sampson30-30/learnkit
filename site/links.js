// Where the site's pages are, written once. Paths are from the site's root folder.
// The header on every page is built from this list, and a test checks that each
// path points at a real page, so a link cannot go stale.

export const HOME = { label: 'LearnKit', path: '' };

export const SITE_LINKS = [
  { id: 'pieces', label: 'Pieces', path: 'examples/' },
  { id: 'looks', label: 'Looks', path: 'gallery/' },
  { id: 'make', label: 'Make your own', path: 'customiser/' },
  {
    id: 'lessons',
    label: 'Lessons',
    menu: [
      { label: 'Git and GitHub', path: 'lesson/' },
      { label: 'How a project fits together', path: 'lesson/architecture/' },
      { label: 'The Social Media Challenge', path: 'lesson/social-media/' },
      { label: 'Teaching Claude with skills', path: 'lesson/claude-skills/' },
    ],
  },
];

/** Every path the header can link to. */
export function allPaths() {
  return [HOME.path, ...SITE_LINKS.flatMap((link) => (link.menu ? link.menu.map((m) => m.path) : [link.path]))];
}
