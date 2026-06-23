// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-test-alternation

function __test_symbolic__(symbolic) {
  if (/a|b|c/.test(symbolic)) {
    // @witness matching /a|b|c/ consumes at least one char, so length can never be <= 0
    __IS_SAT__(symbolic.length <= 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
