// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-literal

function __test_symbolic__(symbolic) {
  if (/HELLO WORLD/.test(symbolic)) {
    // @witness /HELLO WORLD/.test guarantees the substring is present, so indexOf can never be < 0
    __IS_SAT__(symbolic.indexOf("HELLO WORLD") < 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "HELLO WORLD"));
