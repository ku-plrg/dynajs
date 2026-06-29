// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-literal

function __test_symbolic__(symbolic) {
  if (/GOODBYE WORLD/.test(symbolic)) {
    // @witness /GOODBYE WORLD/.test guarantees the substring is present, so indexOf can never be < 0
    __IS_SAT__(symbolic.indexOf("GOODBYE WORLD") < 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "GOODBYE WORLD"));
