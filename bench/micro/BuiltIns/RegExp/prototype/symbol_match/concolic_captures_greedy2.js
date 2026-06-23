// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-singlechar

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^([a-z])$/);
  if (b) {
    // @witness __test_symbolic__("a")
    __IS_SAT__(b[1] === "a", true);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
