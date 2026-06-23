// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^zed??$/.test(symbolic)) {
    // @witness /^zed??$/ admits only "ze" and "zed", so the disjunction always holds under the guard
    __IS_SAT__(!(symbolic === "ze" || symbolic === "zed"), false);
  }
}

__test_symbolic__(__symbolic__('s', "ze"));
