// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^\s$/.test(symbolic)) {
    // @witness __test_symbolic__("\f")
    __IS_SAT__(symbolic === "\f", true);
  }
}

__test_symbolic__(__symbolic__("s", "\f"));
