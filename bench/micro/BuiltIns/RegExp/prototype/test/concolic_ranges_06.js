// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[a-z]*$/.test(symbolic)) {
    // @witness class is lowercase-only, digits "12345" can never match
    __IS_SAT__(symbolic === "12345", false);
  }
}

__test_symbolic__(__symbolic__("s", ""));
