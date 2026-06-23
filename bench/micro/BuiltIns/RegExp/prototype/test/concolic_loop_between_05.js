// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(abc){3,6}$/.test(symbolic)) {
    // @witness the anchored {3,6} admits only 3..6 "abc" repetitions, so every guard-passer is one of those four strings
    __IS_SAT__(!(symbolic === "abcabcabc" || symbolic === "abcabcabcabc" || symbolic === "abcabcabcabcabc" || symbolic === "abcabcabcabcabcabc"), false);
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabc"));
