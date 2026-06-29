import { build } from 'esbuild';
import chalk from 'chalk';

const requireBanner = [
  'import { createRequire } from "node:module";',
  'const require = createRequire(import.meta.url);',
].join('\n');

const entryPoints = [
  {
    entry: 'analyses/taint/src/index.ts',
    outfile: 'analyses/dist/Taint.mjs',
  },
  {
    entry: 'analyses/concolic/src/index.ts',
    outfile: 'analyses/dist/Concolic.mjs',
  },
  {
    entry: 'analyses/noop/index.ts',
    outfile: 'analyses/dist/Noop.mjs',
  },
  {
    entry: 'analyses/noop-nobuiltin/index.ts',
    outfile: 'analyses/dist/NoopNoBuiltin.mjs',
  },
];

const results = await Promise.allSettled(
  entryPoints.map(({ entry, outfile }) =>
    build({
      entryPoints: [entry],
      outfile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node20',
      packages: 'bundle',
      banner: {
        js: requireBanner,
      },
      tsconfig: './analyses/tsconfig.json',
      logLevel: 'warning',
    }),
  ),
);

const failed = results.filter((r) => r.status === 'rejected');
if (failed.length > 0) {
  console.error(
    chalk.red(
      `✗ failed to build ${failed.length} analysis definitions. ${entryPoints.length - failed.length} success, ${failed.length} failed.`,
    ),
  );
  process.exit(1);
}

console.log(chalk.green(`✓ built ${entryPoints.length} analysis definitions`));
