// @type concolic
// @target es5 RegExp.prototype.test
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  if (/^(abc){3}$/.test(symbolic)) {
    // @witness the anchored {3} pins the whole string to exactly three "abc" blocks, so every guard-passer equals "abcabcabc"
    __IS_SAT__(symbolic !== "abcabcabc", false);
  }
  if (/^a{3}$/.test(symbolic)) {
    // @witness the anchored a{3} pins the whole string to exactly three "a" characters, so every guard-passer equals "aaa"
    __IS_SAT__(symbolic !== "aaa", false);
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabc"));
