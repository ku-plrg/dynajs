// NOTE: this file is compile-time only.

import type * as Root from '../constant.js';
import type * as Hooks from '../runtime/hooks.js';
import type * as Constants from './constant.js';
import type { PartialChecker } from './partial.js';

type AssertNever<T extends never> = T;

type HookName = keyof typeof Hooks;


// check 1. constants

// `D$.<name>` constants that are intentionally not hooks. Add here (with a reason)
// if you introduce another non-hook D$ member; anything not listed is flagged.
type NonHookConstant = '_t';

// `'D$'`, straight from the source of truth.
type Prefix = (typeof Root)['DYNAJS_VAR'];

// The value type of every export in constant.ts.
type ConstantValue = (typeof Constants)[keyof typeof Constants];

// Naked-parameter helper so the conditional distributes over the union; each
// `D$.<suffix>` literal yields its suffix, everything else drops to never.
type SuffixOf<T> = T extends `${Prefix}.${infer S}` ? S : never;

// Suffixes of the constants that are supposed to name real hooks (whitelist removed).
type WiredHook = Exclude<SuffixOf<ConstantValue>, NonHookConstant>;

// If either of these is ever non-empty the corresponding assignment fails, and the
// error names the offending hook / constant.
type MissingConstant = Exclude<HookName, WiredHook>; // hook with no constant
type StrayConstant = Exclude<WiredHook, HookName>; // constant naming a non-hook

type _NoMissingConstant = AssertNever<MissingConstant>;
type _NoStrayConstant = AssertNever<StrayConstant>;

// check 2. partial checker

// PartialChecker members that are intentionally NOT hook gates. Add here (with a
// reason) if you introduce another non-hook member; anything not listed is flagged.
type NonHookGate = 'callbackHint' | 'shouldWrapThrow';

// The gate names PartialChecker exposes (everything but the non-hook members).
type GateName = Exclude<keyof PartialChecker, NonHookGate>;

type MissingGate = Exclude<HookName, GateName>; // hook with no gate
type StrayGate = Exclude<GateName, HookName>; // gate naming a non-hook

type _NoMissingGate = AssertNever<MissingGate>;
type _NoStrayGate = AssertNever<StrayGate>;


export {};

