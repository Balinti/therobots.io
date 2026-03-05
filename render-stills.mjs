import { renderStill, selectComposition } from '@remotion/renderer';
import { createServer } from 'remotion';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GAMES } from './remotion/games-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'images', 'thumbs');
const ENTRY_POINT = path.join(__dirname, 'remotion', 'index.ts');
const RENDER_FRAME = 30;

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function main() {
  console.log(`Rendering ${GAMES.length} thumbnails to images/thumbs/...\n`);

  // Bundle once
  const { port, close } = await createServer({
    entryPoint: ENTRY_POINT,
    port: 0,
  });

  const serveUrl = `http://localhost:${port}`;

  let done = 0;
  const errors = [];

  for (const [slug, name, desc, cat, theme] of GAMES) {
    const output = path.join(OUTPUT_DIR, `${slug}.webp`);

    try {
      const composition = await selectComposition({
        serveUrl,
        id: 'GameCaption',
        inputProps: { slug, name, desc, cat, theme },
      });

      await renderStill({
        composition,
        serveUrl,
        output,
        inputProps: { slug, name, desc, cat, theme },
        imageFormat: 'webp',
        jpegQuality: 85,
        frame: RENDER_FRAME,
      });

      done++;
      process.stdout.write(`\r✓ ${done}/${GAMES.length} — ${slug}                    `);
    } catch (err) {
      errors.push({ slug, err: err.message });
      process.stdout.write(`\r✗ ${slug}: ${err.message}\n`);
    }
  }

  await close();

  console.log(`\n\nDone! ${done} thumbnails rendered to images/thumbs/`);
  if (errors.length > 0) {
    console.log(`\nFailed (${errors.length}):`);
    errors.forEach(({ slug, err }) => console.log(`  ${slug}: ${err}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
