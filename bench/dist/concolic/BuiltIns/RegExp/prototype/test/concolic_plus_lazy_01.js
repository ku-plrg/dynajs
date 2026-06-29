// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(hello)+?(world)+?$/.test(symbolic)) {
    // @witness /^(hello)+?(world)+?$/ forces "hello"+"world", so a match is at least 10 chars and never length 0
    __IS_SAT__(symbolic.length === 0, false);
  }

  if (/^z+?$/.test(symbolic)) {
    if (symbolic.length < 5) {
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "hellohelloworld"));
