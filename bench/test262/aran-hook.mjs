// Off-thread module load hook registered by aran-setup.mjs: weaves each ES
// module's source with Aran's "blank" pipeline (transpile -> retropile, no
// advice). Source transform only — the intrinsic record it references lives in
// the main thread (installed by aran-setup.mjs). Mirrors linvail/bin/hook.mjs.

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const INTRINSIC = '_ARAN_INTRINSIC_';

const ARAN_DIR = process.env.ARAN_PATH || '/home/choems/aran';
const requireFromAran = createRequire(path.join(ARAN_DIR, 'package.json'));
const importFromAran = (spec) =>
  import(pathToFileURL(requireFromAran.resolve(spec)).href);

const [{ transpile, retropile }, { parse }, { generate }] = await Promise.all([
  import(pathToFileURL(path.join(ARAN_DIR, 'lib/index.mjs')).href),
  importFromAran('acorn'),
  importFromAran('astring'),
]);

const decoder = new TextDecoder('utf-8');

/** @type {import("node:module").LoadHook} */
export const load = async (location, context, nextLoad) => {
  const result = await nextLoad(location, context);
  if (result.format === 'module' && !location.includes('/node_modules/')) {
    const source =
      typeof result.source === 'string'
        ? result.source
        : decoder.decode(result.source);
    const root = transpile({
      kind: 'module',
      situ: { type: 'global' },
      path: location,
      root: parse(source, { sourceType: 'module', ecmaVersion: 'latest' }),
    });
    result.source = generate(
      retropile(root, { intrinsic_global_variable: INTRINSIC }),
    );
  }
  return result;
};
