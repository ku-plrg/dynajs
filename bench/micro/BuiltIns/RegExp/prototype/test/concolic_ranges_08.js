// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[0-9]+$/.test(symbolic)) {
    // @witness class is digits-only, letters in "12ab34" can never match
    __IS_SAT__(symbolic === "12ab34", false);
  }
}

__test_symbolic__(__symbolic__("s", "12345"));
