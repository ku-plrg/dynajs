// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)+(world)+$/.test(symbolic)) {
    // @witness /^(hello)+(world)+$/ requires at least one "hello" and one "world", so a match is never ""
    __IS_SAT__(symbolic === "", false);
  }

  if (/^z+$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__('s', "hellohelloworld"));
