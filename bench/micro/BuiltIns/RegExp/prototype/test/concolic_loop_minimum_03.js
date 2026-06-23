// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (symbolic.length < 20) {
    if (/^(abc){3,}$/.test(symbolic)) {
      // @witness "abc" is only one repetition, below the {3,} minimum, so it never passes the guard
      __IS_SAT__(symbolic === "abc", false);
    }
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabc"));
