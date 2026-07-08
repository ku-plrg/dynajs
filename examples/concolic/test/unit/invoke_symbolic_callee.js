// Regression: invoking a symbolic value must raise an ordinary "not a function"
// TypeError, not leak the engine's lifted value ("...apply was called on
// #<Object>"). invokeFunPre peeks the callee, so a lifted symbolic primitive
// reaches Function.prototype.apply as a raw non-callable. Surfaced by ExpoSE's
// AHG harness invoking a symbolic value (e.g. minimist's `flags.unknownFn(arg)`).
{
  const callee = __symbolic__('callee', 0);
  let error = '';
  try {
    callee(); // raw non-callable -> plain TypeError, no lifted-value artifact
  } catch (e) {
    error = String(e);
  }
  __symbolic_assert__(!error.includes('#<Object>'), true);
}
