// Brings the blc and howdigital themes in line with their design systems.
//   npm run sync          rewrite the generated colour blocks
//   npm run sync:check    fail if a theme is out of date (nothing is written)
import { sync } from './design-systems.mjs';

const check = process.argv.includes('--check');
const stale = sync({ check });

if (!stale.length) {
  console.log('Themes are in line with their design systems.');
} else if (check) {
  console.error(`Out of date: ${stale.join(', ')}. Run npm run sync.`);
  process.exitCode = 1;
} else {
  console.log(`Updated: ${stale.join(', ')}.`);
}
