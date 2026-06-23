// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^\s$/.test(symbolic)) {
    // @witness __test_symbolic__("\v")
    __IS_SAT__(symbolic === "\v", true);
  }
}

__test_symbolic__(__symbolic__("s", "\v"));
