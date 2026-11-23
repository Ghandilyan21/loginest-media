// Pre-tokenizes Dart code blocks with Shiki so the video shows real VS Code-style highlighting.
// Usage: node scripts/tokenize.mjs src/episodes/ep07.code.json  -> writes ep07.tokens.json next to it
import {codeToTokens} from 'shiki';
import fs from 'node:fs';

const inPath = process.argv[2];
const theme = process.argv[3] || 'tokyo-night';
const suffix = process.argv[4] || '';
const blocks = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const out = {};
for (const [id, lines] of Object.entries(blocks)) {
  const {tokens} = await codeToTokens(lines.join('\n'), {lang: 'dart', theme});
  out[id] = tokens.map((line) => line.map((t) => ({c: t.content, k: t.color, i: (t.fontStyle & 1) === 1})));
}
fs.writeFileSync(inPath.replace('.code.json', suffix + '.tokens.json'), JSON.stringify(out));
console.log('tokenized', Object.keys(out).join(', '));
