import * as fs from 'node:fs/promises';

// clear dist
await fs.rm('./dist', { force: true, recursive: true });

// build bundles
await Bun.build({
  entrypoints: ['./src/index.ts'],
  target: 'node',
  outdir: './dist',
});
