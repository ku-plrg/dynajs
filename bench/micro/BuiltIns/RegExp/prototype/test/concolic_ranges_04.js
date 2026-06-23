// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[a-z]*$/.test(symbolic)) {
    // @witness __test_symbolic__("abcdef")
    __IS_SAT__(symbolic === "abcdef", true);
  }
}

__test_symbolic__(__symbolic__("s", "abcdef"));
