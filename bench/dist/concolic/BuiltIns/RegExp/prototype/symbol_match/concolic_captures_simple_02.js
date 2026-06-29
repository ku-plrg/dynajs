// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-simple

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(a)/);
  if (b) {
    // @witness __test_symbolic__("abcabcabcabcabca")
    __IS_SAT__(symbolic === "abcabcabcabcabca", true);
  }
}

__test_symbolic__(__symbolic__("x", "abcabcabcabcabca"));
