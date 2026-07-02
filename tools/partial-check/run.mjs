// Bundle a partial-check entry with esbuild (it depends on `typescript`) and run
// it. `--test` runs the domain unit tests; otherwise runs the checker against
// the repo root. Kept out-of-band from tsc; this is a build-time tool.
import esbuild from 'esbuild';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const mode = process.argv.includes('--test')
  ? 'test'
  : process.argv.includes('--gen')
    ? 'gen'
    : 'check';
const here = new URL('.', import.meta.url).pathname;
const entryFile = { test: 'domain/domain.test.ts', gen: 'gen.ts', check: 'main.ts' }[mode];
const entry = join(here, entryFile);
const out = join(tmpdir(), `partial-check.${mode}.cjs`);

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: out,
  logLevel: 'error',
});

// the checker reads the repo root from argv[2]; keep it as process.cwd()
process.argv = [process.argv[0], out, process.cwd()];
await import(pathToFileURL(out).href);
