// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[0-9]+$/.test(symbolic)) {
    // @witness + requires at least one digit, so the empty string never matches
    __IS_SAT__(symbolic === "", false);
  }
}

__test_symbolic__(__symbolic__("s", "12345"));
