// Turns a built French page into its English version.
// The French pages stay the only source: src/i18n/en.json maps each French text to its English one.

const TOKEN = /(<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/;
const ATTR = /\s(alt|title|aria-label|placeholder|data-label|data-wa)="([^"]*)"/g;
const META = /<meta[^>]*(?:name="(?:description|twitter:title|twitter:description)"|property="og:(?:title|description)")[^>]*>/;
const WA = /(href="https:\/\/wa\.me\/\d+\?text=)([^"]+)"/;

const norm = s => s.replace(/\s+/g, ' ').trim();
// a text is worth translating when it holds at least two letters in a row
const wordy = s => /\p{L}{2}/u.test(s.replace(/&[a-z]+;/g, ' '));

function walk(html, visit) {
  return html.split(TOKEN).map(tok => {
    if (!tok) return tok;
    if (/^<(!--|script|style)/.test(tok)) return tok;
    if (tok[0] === '<') {
      let t = tok.replace(ATTR, (m, name, v) => (wordy(v) ? ` ${name}="${visit(v)}"` : m));
      if (META.test(t)) t = t.replace(/content="([^"]*)"/, (m, v) => (wordy(v) ? `content="${visit(v)}"` : m));
      t = t.replace(WA, (m, pre, q) => `${pre}${encodeURIComponent(visit(decodeURIComponent(q)))}"`);
      return t;
    }
    if (!tok.trim()) return tok;
    const [, a, body, z] = tok.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return a + visit(body) + z;
  }).join('');
}

export function segments(html) {
  const out = new Set();
  walk(html, s => (wordy(s) && out.add(norm(s)), s));
  return out;
}

export function translate(html, dict, missing) {
  return walk(html, s => {
    const k = norm(s);
    if (k in dict) return dict[k];
    if (wordy(k)) missing.add(k);
    return s;
  });
}
