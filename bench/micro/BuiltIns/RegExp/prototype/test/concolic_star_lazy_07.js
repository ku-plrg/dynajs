// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)*?(world)*?$/.test(symbolic)) {
    // @witness "hellohelloworl" is a truncated "world" tail, so it fails the guard and symbolic === "hellohelloworl" is unsatisfiable here
    __IS_SAT__(symbolic === "hellohelloworl", false);
  }
}

__test_symbolic__(__symbolic__("s", "world"));
