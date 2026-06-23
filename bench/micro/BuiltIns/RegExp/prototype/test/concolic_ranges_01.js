// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[abcd]$/.test(symbolic)) {
    // @witness __test_symbolic__("c")
    __IS_SAT__(symbolic === "c", true);
  }
}

__test_symbolic__(__symbolic__("s", "c"));
