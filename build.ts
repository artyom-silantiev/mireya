import * as fs from 'node:fs/promises';

// clear dist
await fs.rm('./dist', { force: true, recursive: true });

// build bundles
const res = await Bun.build({
  entrypoints: ['./src/entry.ts'],
  target: 'node',
  outdir: './dist',
});
