// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  // @witness __test_symbolic__("a")
  __IS_SAT__(/^\D$/.test(symbolic), true);
}

__test_symbolic__(__symbolic__("s", ""));
