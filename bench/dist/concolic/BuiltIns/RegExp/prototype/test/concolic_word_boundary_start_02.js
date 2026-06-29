// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-word-boundary

function __test_symbolic__(symbolic) {
  if (/^\b.$/.test(symbolic)) {
    // @witness " " is not a word char, so the leading \b boundary fails the guard for the only candidate
    __IS_SAT__(symbolic === " ", false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
