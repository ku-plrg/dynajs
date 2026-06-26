import type { DynaJSType } from '../../../src/analysis.js';

declare const D$: DynaJSType;

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

const UNKNOWN_SITE: Site = { kind: 'unknown' };

function resolveCodeSite(id: number): Site {
  const loc = D$.ids?.[id];
  const file = D$.idToFile?.(id);
  if (loc === undefined || file === undefined) return UNKNOWN_SITE;
  return {
    kind: 'code',
    id,
    file,
    start: { line: loc[0], column: loc[1] },
    end: { line: loc[2], column: loc[3] },
  };
}

export class SiteResolver {
  private currentId: number | undefined = undefined;
  private currentBuiltin: string | undefined = undefined;

  reportId(id: number | undefined): void {
    this.currentId = id;
  }

  reportBuiltin(name: string | undefined): void {
    this.currentBuiltin = name;
  }

  withBuiltinSite<T>(name: string, body: () => T): T {
    const savedBuiltin = this.currentBuiltin;
    this.currentBuiltin = name;
    try {
      return body();
    } finally {
      this.currentBuiltin = savedBuiltin;
    }
  }

  resolve(): Site {
    if (this.currentBuiltin !== undefined) {
      const call =
        this.currentId !== undefined
          ? resolveCodeSite(this.currentId)
          : UNKNOWN_SITE;
      return {
        kind: 'builtin',
        name: this.currentBuiltin,
        call: call.kind === 'code' ? call : undefined,
      };
    }
    if (this.currentId !== undefined) return resolveCodeSite(this.currentId);
    return UNKNOWN_SITE;
  }

  resolveCodeSite(id: number): Site {
    const loc = D$.ids[id];
    const file = D$.idToFile(id);
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
  builtinName(f: unknown): string {
    const n = typeof f === 'function' ? f.name : '';
    return n !== '' ? n : 'builtin';
  }
}
