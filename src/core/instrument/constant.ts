import { DYNAJS_VAR } from '../constant.js';
import type * as Hooks from '../runtime/hooks.js';

// The names the instrumenter is allowed to reference as `D$.<name>` — exactly the
// hooks exported from runtime/hooks.ts. `import type` so this adds no runtime
// dependency (and cannot cause an import cycle) while still being a tracked edge, so
// an incremental `tsc -b` re-checks the hook() calls below when hooks.ts changes.
type HookName = keyof typeof Hooks;

// Builds a `D$.<name>` constant while forcing <name> to be a real hook. A rename in
// hooks.ts that isn't mirrored here fails to type-check at the exact `hook(...)` call.
const hook = <N extends HookName>(name: N): `${typeof DYNAJS_VAR}.${N}` =>
  `${DYNAJS_VAR}.${name}`;

// logging function names
export const SCRIPT_ENTER = hook('Se');
export const SCRIPT_EXIT = hook('Sx');
export const FUNCTION_CALL = hook('F');
export const METHOD_CALL = hook('M');
export const PRIVATE_METHOD_CALL = hook('Mp');
export const TAGGED_FUNC = hook('TF');
export const TAGGED_METHOD = hook('TM');
export const PRIVATE_TAGGED_METHOD = hook('TMp');
export const FUNC_ENTER = hook('Fe');
export const FUNC_EXIT = hook('Fx');
export const RETURN = hook('Re');
export const FOR_IN_OF_OBJECT = hook('O');
export const EXPRESSION = hook('E');
export const GET_FIELD = hook('G');
export const PUT_FIELD = hook('P');
export const PRIVATE_GET_FIELD = hook('Gp');
export const PRIVATE_PUT_FIELD = hook('Pp');
export const DELETE_OP = hook('De');
export const UNARY_OP = hook('U');
export const BINARY_OP = hook('B');
export const UPDATE_OP = hook('Up');
export const CONDITION = hook('C');
export const SWITCH_LEFT = hook('Swl');
export const SWITCH_RIGHT = hook('Swr');
export const CLASS_HERITAGE = hook('Hc');
export const DECLARE = hook('D');
export const READ = hook('R');
export const WRITE = hook('W');
export const LITERAL = hook('L');
export const THROW = hook('Th');
export const EXCEPTION = hook('X');
// not a hook — a scratch temp var accessed as `D$._t`, so it is not routed through
// hook(). Kept literal-typed (`as const`) so it doesn't widen the exhaustiveness
// check's union of constant values down to `string`.
export const TEMP_VAR = `${DYNAJS_VAR}._t` as const;
export const YIELD = hook('Y');
export const YIELD_RESULT = hook('Yr');
export const AWAIT = hook('Aw');
export const AWAIT_RESULT = hook('Awr');
export const CHAIN = hook('Ch');
export const SPREAD = hook('Sp');
export const FIELD_INIT = hook('Fi');
export const CATCH_ENTER = hook('Ce');
export const SUPER_CALL = hook('Su');
export const SUPER_METHOD_CALL = hook('Sm');
export const SUPER_GET_FIELD = hook('Gs');
export const SUPER_PUT_FIELD = hook('Ps');
export const EVAL_CODE = hook('Ev');
export const LCV_SET = hook('Lcs');
export const LCV_GET = hook('Lcv');
export const TEMPLATE_LITERAL = hook('TL');
