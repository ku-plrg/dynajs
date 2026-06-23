// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^qerf??ef?$/.test(symbolic)) {
    // @witness __test_symbolic__("qere")
    __IS_SAT__(symbolic === "qere", true);
  }
}

__test_symbolic__(__symbolic__('s', "qere"));
