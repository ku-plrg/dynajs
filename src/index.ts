// Public API surface of dynajs core. Analyses must import from here only,
// never from core internals — the boundary is enforced by scripts/check-boundaries.mjs.

export type { DynaJSType } from './runtime/analysis.js';
export type { AnalysisCallback as Analysis } from './types/analysis.js';
