// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)*?(world)*?$/.test(symbolic)) {
    // @witness "d" is neither a (hello) nor (world) repetition, so it fails the guard and symbolic === "d" is unsatisfiable here
    __IS_SAT__(symbolic === "d", false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
