import fs from 'node:fs';
import path from 'node:path';
import {
  type CompilationOptions,
  type EntryPointConfig,
  generateDtsBundle,
} from 'dts-bundle-generator';
import { getTsconfig } from 'get-tsconfig';
import type { BunPlugin } from 'bun';

// Based on https://github.com/wobsoriano/bun-plugin-dts
export type DtsOptions = Omit<EntryPointConfig, 'filePath'> & {
  srcDir?: string;
  compilationOptions?: CompilationOptions;
};
export const dts = (options?: DtsOptions): BunPlugin => {
  return {
    name: 'bun-plugin-dts',
    async setup(build) {
      const srcDir = options?.srcDir || './src';
      const { compilationOptions, ...rest } = options || {};

      const entrypoints = [...build.config.entrypoints].sort();
      const entries = entrypoints.map((entry) => {
        return {
          filePath: entry,
          ...rest,
        };
      });

      const tsconfig =
        compilationOptions?.preferredConfigPath ?? getTsconfig()?.path;
      const result = generateDtsBundle(entries, {
        ...compilationOptions,
        preferredConfigPath: tsconfig,
      });

      const outDir = build.config.outdir || './dist';
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
      }

      await Promise.all(
        entrypoints.map((entry, index) => {
          let dtsFile = entry
            .replace(srcDir, '')
            .replace(/\.[jtm]s$/, '.d.ts');
          const outFile = path.join(outDir, dtsFile);
          return Bun.write(outFile, result[index]);
        }),
      );
    },
  };
};