// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^qerf??ef?$/.test(symbolic)) {
    // @witness /^qerf??ef?$/ admits only the 4 listed strings, so the disjunction always holds under the guard
    __IS_SAT__(!(symbolic === "qere" || symbolic === "qerfe" || symbolic === "qeref" || symbolic === "qerfef"), false);
  }
}

__test_symbolic__(__symbolic__('s', "qere"));
