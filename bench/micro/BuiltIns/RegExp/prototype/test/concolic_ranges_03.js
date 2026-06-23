// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-char-class

function __test_symbolic__(symbolic) {
  if (/^[abcd]$/.test(symbolic)) {
    // @witness guard forbids "e", only a,b,c,d match the class
    __IS_SAT__(symbolic === "e", false);
  }
}

__test_symbolic__(__symbolic__("s", "c"));
