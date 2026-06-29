// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[abcd]$/.test(symbolic)) {
    // @witness guard pins to one of a,b,c,d so the string is never empty
    __IS_SAT__(symbolic === "", false);
  }
}

__test_symbolic__(__symbolic__("s", "c"));
