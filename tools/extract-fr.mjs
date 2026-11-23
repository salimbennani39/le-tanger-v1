// Lists the French texts of the built pages that have no English version yet in src/i18n/en.mjs.
// Usage: node tools/extract-fr.mjs   (add --all to list every text)
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { segments } from '../src/i18n/translate.mjs';
import en from '../src/i18n/en.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [...readdirSync(ROOT).filter(f => f.endsWith('.html')), ...readdirSync(join(ROOT, 'residences')).map(f => 'residences/' + f)]
  .filter(f => !readFileSync(join(ROOT, f), 'utf8').includes('http-equiv="refresh"'));
const all = new Map();
for (const f of files) for (const s of segments(readFileSync(join(ROOT, f), 'utf8'))) if (!all.has(s)) all.set(s, f);
const list = [...all].filter(([s]) => process.argv.includes('--all') || !(s in en));
for (const [s, f] of list) console.log(`${f}\t${s}`);
console.log(`${list.length} of ${all.size} texts listed`);
const unused = Object.keys(en).filter(k => !all.has(k) && !/, photo \d+$/.test(k));
if (unused.length) console.log(`unused keys: ${unused.join(' | ')}`);
