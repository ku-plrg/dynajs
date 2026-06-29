// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-literal

function __test_symbolic__(symbolic) {
  if (/ /.test(symbolic)) {
    // @witness the / / guard forces a space into the string, so indexOf(" ") is always >= 0 and can never be < 0
    __IS_SAT__(symbolic.indexOf(" ") < 0, false);
  }
}

__test_symbolic__(__symbolic__("s", " "));
