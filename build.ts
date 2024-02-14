import { dts } from './build-plugins';
import * as fs from 'node:fs/promises';

async function copyToDist(file: string) {
  await fs.cp(`${file}`, `./dist/${file}`);
}

const entrypoints = [
  './src/app/index.ts',
  './src/module/index.ts'
];

// clear dist
await fs.rm('./dist', { force: true, recursive: true });

// build bundles
await Bun.build({
  entrypoints,
  target: 'node',
  outdir: './dist',
  plugins: [dts()],
});

// copy files
await copyToDist('./README.md');
await copyToDist('./package.json');
await copyToDist('./LICENCE');
