'use strict';

// dynajs concolic bridge for ExpoSE's `S$` module (its SDollar / AssertToolkit).
//
// When running under scripts/dynajs-play this resolves ahead of ExpoSE's own
// lib/S$ (NODE_PATH precedence) and is itself dynajs-instrumented — it sits on
// an --include root. That instrumentation is the point: the `if`s inside
// assume/assert become path conditions the analysis sees, exactly as ExpoSE's
// Jalangi-instrumented S$ does. ExpoSE's lib/S$ instead routes through
// Object._expose.* (Jalangi hooks) which do not exist under dynajs.
//
// symbol/pureSymbol delegate to the analysis via prelude ghosts (symbolic
// minting + per-run name uniquing); assume/assert/fail keep AssertToolkit's
// concrete control flow so dynajs observes their branches.

var S$ = {};

// Pruning sentinel: assume(false) throws this — it means "this path violates an
// assumption", NOT a program error. ExpoSE gets it from
// Object._expose.notAnError(); we define it here and stash it so the analysis
// can recognise it when classifying uncaught throws (M6).
function NotAnErrorException() {}
S$.NotAnErrorException = NotAnErrorException;
globalThis.__NotAnError__ = NotAnErrorException;

// Two args (name, concrete) => seeded symbol; one arg => typeless pure symbol.
// A genuinely-absent second argument is the only `undefined` case here, so this
// holds whether or not `typeof` sees through the lifted value.
S$.symbol = function (name, concrete) {
  if (typeof concrete !== 'undefined') {
    return globalThis.__s_symbol__(name, concrete);
  }
  return S$.pureSymbol(name);
};

S$.pureSymbol = function (name) {
  return globalThis.__s_pure__(name);
};

S$.assume = function (val) {
  if (!val) {
    throw new NotAnErrorException();
  }
};

S$.fail = function (reason) {
  throw reason;
};

S$.assert = function (value, desc) {
  if (!value) {
    if (desc instanceof Function) {
      desc = desc();
    }
    S$.fail(desc);
  }
};

module.exports = S$;
