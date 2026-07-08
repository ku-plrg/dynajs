import { build } from 'esbuild';
import chalk from 'chalk';

const requireBanner = [
  'import { createRequire } from "node:module";',
  'const require = createRequire(import.meta.url);',
].join('\n');

const entryPoints = [
  {
    entry: 'examples/taint/src/index.ts',
    outfile: 'examples/dist/Taint.mjs',
  },
  {
    entry: 'examples/concolic/src/index.ts',
    outfile: 'examples/dist/Concolic.mjs',
  },
  {
    entry: 'examples/noop/index.ts',
    outfile: 'examples/dist/Noop.mjs',
  },
  {
    entry: 'examples/noop-nobuiltin/index.ts',
    outfile: 'examples/dist/NoopNoBuiltin.mjs',
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
      tsconfig: './examples/tsconfig.json',
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
