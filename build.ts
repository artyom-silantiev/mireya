import * as fs from 'node:fs/promises';

// clear dist
await fs.rm('./dist', { force: true, recursive: true });

// build bundles
const res = await Bun.build({
  entrypoints: ['./src/app_main/index.ts'],
  target: 'node',
  outdir: './dist',
});
