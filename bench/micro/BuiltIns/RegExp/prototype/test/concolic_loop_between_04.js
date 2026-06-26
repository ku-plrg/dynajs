// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(abc){3,6}$/.test(symbolic)) {
    // @witness __test_symbolic__("abcabcabcabcabcabc")
    __IS_SAT__(symbolic === "abcabcabcabcabcabc", true);
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabcabcabc"));
