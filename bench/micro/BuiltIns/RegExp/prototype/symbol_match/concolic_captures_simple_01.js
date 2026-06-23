// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-simple

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(a)/);
  if (b) {
    // @witness __test_symbolic__("aaaabaa")
    __IS_SAT__(symbolic === "aaaabaa", true);
  }
}

__test_symbolic__(__symbolic__("x", "aaaabaa"));
