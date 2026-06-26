// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-word-boundary

function __test_symbolic__(symbolic) {
  if (/^\b.$/.test(symbolic)) {
    // @witness __test_symbolic__("a")
    __IS_SAT__(symbolic === "a", true);
  }
}

__test_symbolic__(__symbolic__("s", "A"));
