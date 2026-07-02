import fs from 'node:fs';
import path from 'node:path';

const TARGET_SUFFIXES = ['.js', '.cjs', '.mjs'];

export function isInstrumentedTarget(name) {
  return TARGET_SUFFIXES.some((suffix) => name.endsWith(`__dynajs__${suffix}`));
}

// Every runnable target under `root`: any *.js/*.cjs/*.mjs that is not an
// emitted __dynajs__ artifact. Absolute paths, sorted for stable test ordering.
export function iterTestTargets(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (
        entry.isFile() &&
        TARGET_SUFFIXES.includes(path.extname(entry.name)) &&
        !isInstrumentedTarget(entry.name)
      ) {
        out.push(full);
      }
    }
  };
  walk(root);
  return out.sort();
}
