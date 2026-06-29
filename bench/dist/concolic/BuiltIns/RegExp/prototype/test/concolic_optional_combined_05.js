// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a?bcd(bcde)??$/.test(symbolic)) {
    // @witness /^a?bcd(bcde)??$/ admits only the 4 listed strings, so the disjunction always holds under the guard
    __IS_SAT__(!(symbolic === "bcd" || symbolic === "abcd" || symbolic === "bcdbcde" || symbolic === "abcdbcde"), false);
  }
}

__test_symbolic__(__symbolic__('s', "bcd"));
