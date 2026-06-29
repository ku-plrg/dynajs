// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)+?(world)+?$/.test(symbolic)) {
    // @witness same match requires "hello"+"world", so it can never be the empty string
    __IS_SAT__(symbolic === "", false);
  }

  if (/^z+?$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "hellohelloworld"));
