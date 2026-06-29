// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-literal

function __test_symbolic__(symbolic) {
  if (/AND ME/.test(symbolic)) {
    // @witness /AND ME/.test guarantees the substring is present, so indexOf can never be < 0
    __IS_SAT__(symbolic.indexOf("AND ME") < 0, false);
  }
}

__test_symbolic__(__symbolic__("s", "AND ME"));
