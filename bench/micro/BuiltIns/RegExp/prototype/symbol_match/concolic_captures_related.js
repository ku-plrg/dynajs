// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-related

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(.+)q(.+)$/);
  if (b) {
    // @witness __test_symbolic__("aqa")
    __IS_SAT__(b[1] === b[2], true);
  }
}

__test_symbolic__(__symbolic__("s", "aqa"));
