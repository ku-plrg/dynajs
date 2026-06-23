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

export function isInstrumentTarget(
  filepath: string,
  options: Pick<RuntimeOptions, 'includeRoots' | 'ignoreNodeModules'>,
): boolean {
  for (const root of options.includeRoots) {
    const relative = path.relative(root, filepath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
    // is .includes good enough?
    if (options.ignoreNodeModules && relative.includes('node_modules'))
      continue;
    return true;
  }
  return false;
}
