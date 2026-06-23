// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-word-boundary

function __test_symbolic__(symbolic) {
  if (/^.\b.$/.test(symbolic)) {
    // @witness the guard forces exactly two chars, so a single-char string never reaches this path
    __IS_SAT__(symbolic === " ", false);
  }
}

__test_symbolic__(__symbolic__("s", "a "));
