// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-test-alternation-nested

function __test_symbolic__(symbolic) {
  if (/a|b|c/.test(symbolic)) {
    if (/b/.test(symbolic)) {
      // @witness __test_symbolic__("ab")
      __IS_SAT__(/a/.test(symbolic), true);
    }
  }
}

__test_symbolic__(__symbolic__('s', "ab"));
