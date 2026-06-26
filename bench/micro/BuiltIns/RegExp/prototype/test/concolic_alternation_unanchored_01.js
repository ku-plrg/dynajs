// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-alternation

function __test_symbolic__(symbolic) {
  if (/^a|b|c$/.test(symbolic)) {
    // @witness __test_symbolic__("ax")
    __IS_SAT__(!(symbolic === "a" || symbolic === "b" || symbolic === "c"), true);
  }
}

__test_symbolic__(__symbolic__("s", "axax"));
