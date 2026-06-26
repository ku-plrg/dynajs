// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a?bcd(bcde)??$/.test(symbolic)) {
    // @witness __test_symbolic__("abcdbcde")
    __IS_SAT__(symbolic === "abcdbcde", true);
  }
}

__test_symbolic__(__symbolic__('s', "bcdbcde"));
