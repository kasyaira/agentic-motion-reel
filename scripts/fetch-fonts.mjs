// Download Google Fonts locally for deterministic rendering (no CDN at render time)
import { mkdirSync, writeFileSync, existsSync } from 'fs';

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const OUT = 'public/fonts';
mkdirSync(OUT, { recursive: true });

const families = [
  { name: 'SpaceGrotesk', css: 'family=Space+Grotesk:wght@400;500;700', weights: ['400', '500', '700'] },
  { name: 'Inter', css: 'family=Inter:wght@400;600;800', weights: ['400', '600', '800'] },
  { name: 'JetBrainsMono', css: 'family=JetBrains+Mono:wght@400;700', weights: ['400', '700'] },
];

for (const fam of families) {
  for (const w of fam.weights) {
    const file = `${OUT}/${fam.name}-${w}.woff2`;
    if (existsSync(file)) { console.log('skip', file); continue; }
    const url = `https://fonts.googleapis.com/css2?${fam.css}&display=block`;
    const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    // find the latin subset block (last block usually latin)
    const blocks = css.split('/*').filter((b) => b.includes('unicode-range'));
    const latin = blocks.find((b) => b.startsWith(' latin */')) || blocks[blocks.length - 1];
    const m = latin.match(/url\((https:[^)]+\.woff2)\)/);
    if (!m) { console.error('NO URL for', fam.name, w); process.exit(1); }
    const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
    writeFileSync(file, buf);
    console.log('ok', file, (buf.length / 1024).toFixed(0) + 'KB');
  }
}
