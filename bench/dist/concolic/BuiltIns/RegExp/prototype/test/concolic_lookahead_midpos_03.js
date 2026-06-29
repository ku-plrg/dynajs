// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^.(?=(a|b|c)).$/.test(symbolic)) {
    // @witness __test_symbolic__("Xb")
    __IS_SAT__(symbolic.charAt(1) === "b", true);
  }
}

__test_symbolic__(__symbolic__('s', "xb"));
