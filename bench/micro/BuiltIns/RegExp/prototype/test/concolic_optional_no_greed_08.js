// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^a??b??c??$/.test(symbolic)) {
    // @witness __test_symbolic__("abc")
    __IS_SAT__(symbolic === "abc", true);
  }
}

__test_symbolic__(__symbolic__('s', "bc"));
