// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)+?(world)+?$/.test(symbolic)) {
    // @witness __test_symbolic__("hellohelloworld")
    __IS_SAT__(symbolic === "hellohelloworld", true);
  }

  if (/^z+?$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "hellohellohelloworld"));
