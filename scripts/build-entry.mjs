import { build } from 'esbuild';
import { chmodSync } from 'node:fs';
import chalk from 'chalk';

const requireBanner = [
  'import { createRequire } from "node:module";',
  'const require = createRequire(import.meta.url);',
].join('\n');

const entryPoints = [
  {
    entry: 'src/entry/import.ts',
    outfile: 'dist/entry/import.js',
  },
  {
    entry: 'src/entry/register.ts',
    outfile: 'dist/entry/register.js',
  },
  {
    entry: 'src/bin/djx.ts',
    outfile: 'dist/bin/djx.js',
    shebang: true,
  },
];

const results = await Promise.allSettled(
  entryPoints.map(({ entry, outfile, shebang }) =>
    build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node20',
      packages: 'bundle',
      banner: {
        js: shebang ? `#!/usr/bin/env node\n${requireBanner}` : requireBanner,
      },
      logLevel: 'warning',
    }),
  ),
);

for (let i = 0; i < results.length; i++) {
  if (results[i].status === 'fulfilled' && entryPoints[i].shebang) {
    chmodSync(entryPoints[i].outfile, 0o755);
  }
}

const failed = results.filter((r) => r.status === 'rejected');
if (failed.length > 0) {
  console.error(
    chalk.red(
      `✗ failed to build ${failed.length} entries. ${entryPoints.length - failed.length} success, ${failed.length} failed.`,
    ),
  );
  process.exit(1);
}

console.log(chalk.green(`✓ built ${entryPoints.length} entries`));
