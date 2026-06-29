// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (symbolic.length < 10) {
    if (/^z+$/.test(symbolic)) {
      // @witness /^z+$/ requires at least one char, so a match is never the empty string
      __IS_SAT__(symbolic === "", false);
      for (var i = 0; i < symbolic.length; i++) {
      }
    }
  }
}

__test_symbolic__(__symbolic__("s", "z"));
