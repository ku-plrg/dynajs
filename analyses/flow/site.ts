export type Pos = { line: number; column: number };
export type CodeSite = {
  kind: 'code';
  id: number;
  file: string;
  start: Pos;
  end: Pos;
};
export type Site =
  | CodeSite
  | { kind: 'builtin'; name: string; call?: CodeSite }
  | { kind: 'unknown' };

export const UNKNOWN_SITE: Site = { kind: 'unknown' };

// Resolve a user-code site from an instruction id, lazily through the runtime
// global (same access pattern as flow.ts's isInstrumentedFn). Returns `unknown`
// when the id table has no entry — notably under `--pos memory` for ESM, where
// the runtime merge no-ops (locations require `--pos persist`; parity with
// D$.idToLoc — see analysis.ts).
export function resolveCodeSite(id: number): Site {
  const d$ = (
    globalThis as {
      D$?: {
        ids?: Record<number, [number, number, number, number]>;
        idToFile?: (id: number) => string | undefined;
      };
    }
  ).D$;
  const loc = d$?.ids?.[id];
  const file = d$?.idToFile?.(id);
  if (loc === undefined || file === undefined) return UNKNOWN_SITE;
  return {
    kind: 'code',
    id,
    file,
    start: { line: loc[0], column: loc[1] },
    end: { line: loc[2], column: loc[3] },
  };
}

/* readable name for a modeled builtin (builtin-kind sites) */
export function builtinName(f: unknown): string {
  const n = typeof f === 'function' ? f.name : '';
  return n !== '' ? n : 'builtin';
}
