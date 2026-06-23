import { warn } from '../utils.js';
import { isPatched } from './vm.js';

export function tryToRegisterWarningHook(): void {
  if (isPatched()) return; // if vm is already patched, no need to register warning hook
  // NOTE `registerHooks` is a version dependent feature, so we need to dynamically import it and handle the case where it's not available.
  import('node:module')
    .then(({ registerHooks }) => {
      const warned = new Set();
      const target = new Set([
        'vm',
        'node:vm',
        'vm/promises',
        'node:vm/promises',
      ]);

      registerHooks({
        resolve(specifier, context, nextResolve) {
          const r = nextResolve(specifier, context);

          if (!warned.has(specifier) && target.has(specifier)) {
            warned.add(specifier);
            warn(
              `Detected import/require of ${specifier}. This module is not instrumented and may cause incomplete analysis results. Consider bridging it with dynajs API exposed via \`globalThis.D$.instrument\`. @ ${context.parentURL ?? 'unknown'}.`,
            );
          }

          return r;
        },
      });
    })
    .catch(() => {
      warn(
        'Failed to register warning hook. Code loaded by `vm` modules will not be instrumented. It is your responsibility to bridge them with dynajs API exposed via `globalThis.D$.instrument` to ensure complete analysis results.',
      );
    });
}
