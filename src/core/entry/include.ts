import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RuntimeOptions } from './options.js';

export function getFilePathFromUrl(url: string): string | null {
  if (!url.startsWith('file://')) {
    return null;
  }
  const parsed = new URL(url);
  parsed.search = '';
  parsed.hash = '';
  return fileURLToPath(parsed);
}

function isUnder(root: string, filepath: string): boolean {
  const relative = path.relative(root, filepath);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function isInstrumentTarget(
  filepath: string,
  options: Pick<
    RuntimeOptions,
    'includeRoots' | 'excludeRoots' | 'ignoreNodeModules'
  >,
): boolean {
  // An explicit exclude root wins over the include roots (the always-present cwd
  // makes those broad). Carves out e.g. the analysis's own native solver dep.
  for (const ex of options.excludeRoots) {
    if (isUnder(ex, filepath)) return false;
  }
  for (const root of options.includeRoots) {
    if (!isUnder(root, filepath)) continue;
    // is .includes good enough?
    if (
      options.ignoreNodeModules &&
      path.relative(root, filepath).includes('node_modules')
    )
      continue;
    return true;
  }
  return false;
}
