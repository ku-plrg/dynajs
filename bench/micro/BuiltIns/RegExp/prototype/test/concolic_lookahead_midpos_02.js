// @type concolic
// @target es6+ RegExp.prototype.test
// @feature builtin regexp-lookahead

function __test_symbolic__(symbolic) {
  if (/^.(?=(a|b|c)).$/.test(symbolic)) {
    // @witness __test_symbolic__("Xa")
    __IS_SAT__(symbolic.charAt(1) === "a", true);
  }
}

__test_symbolic__(__symbolic__('s', "Xa"));
