// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (symbolic.length < 20) {
    if (/^(abc){3,}$/.test(symbolic)) {
      // @witness /^(abc){3,}$/ forces at least three "abc" repetitions, so a guard-passer is always >= 9 chars
      __IS_SAT__(symbolic.length < 9, false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabc"));
