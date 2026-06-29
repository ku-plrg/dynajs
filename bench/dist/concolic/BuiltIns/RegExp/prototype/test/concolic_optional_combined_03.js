// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a?bcd(bcde)??$/.test(symbolic)) {
    // @witness __test_symbolic__("bcdbcde")
    __IS_SAT__(symbolic === "bcdbcde", true);
  }
}

__test_symbolic__(__symbolic__('s', "abcd"));
