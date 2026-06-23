// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^(?=(a|b|c)).$/.test(symbolic)) {
    // @witness __test_symbolic__("a")
    __IS_SAT__(symbolic === "a", true);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
