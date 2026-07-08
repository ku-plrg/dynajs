import type { DYNAJS_VAR } from '../constant.js';
import type * as Hooks from '../runtime/hooks.js';
import type { State } from './state.js';

type HookName = keyof typeof Hooks;

// A single emitted argument: a ready-made source chunk (e.g. `"${op}"`,
// `String(newId(node))`) or a thunk that writes it — typically `() => state.walk(node)`.
// Thunks are invoked in argument order, so any newId()/side effects happen in the same
// order as the equivalent hand-written state.write sequence.
export type Arg = string | (() => void);

// The hook function that a `D$.<name>` callee string refers to.
type HookFor<C extends string> = C extends `${typeof DYNAJS_VAR}.${infer N}`
  ? N extends HookName
    ? (typeof Hooks)[N]
    : never
  : never;

// Replaces every element of a parameter tuple with Arg. The `readonly unknown[]`
// constraint is what makes this map tuple→tuple (preserving arity and trailing-
// optional slots) instead of degrading to an object over `keyof` (length, methods…).
type ArgTuple<P extends readonly unknown[]> = { [K in keyof P]: Arg };

// One Arg per hook parameter, carrying the hook's exact arity and its trailing-
// optional params (e.g. G's `optional?: boolean`).
export type ArgsFor<C extends string> = ArgTuple<Parameters<HookFor<C>>>;

// Emits `<callee>(<args>)`. `callee` must be a hook constant from constant.ts and
// `args` must match the arity of the hook it names — both checked at compile time
// against runtime/hooks.ts. The generated argument *values* are still opaque strings;
// only their count (and the callee name) is verified.
export function emitCall<C extends `${typeof DYNAJS_VAR}.${HookName}`>(
  state: State,
  callee: C,
  ...args: ArgsFor<C>
): void {
  state.write(`${callee}(`);
  for (let i = 0; i < args.length; i++) {
    if (i > 0) state.write(', ');
    const a = args[i] as Arg;
    if (typeof a === 'string') state.write(a);
    else a();
  }
  state.write(')');
}

// Like emitCall but as a statement on its own line: `<newline+indent><callee>(...);`.
// Matches the old `state.writeln(`${LOG.X}(...);`)` sites.
export function emitCallStmt<C extends `${typeof DYNAJS_VAR}.${HookName}`>(
  state: State,
  callee: C,
  ...args: ArgsFor<C>
): void {
  state.writeln('');
  emitCall(state, callee, ...args);
  state.write(';');
}
