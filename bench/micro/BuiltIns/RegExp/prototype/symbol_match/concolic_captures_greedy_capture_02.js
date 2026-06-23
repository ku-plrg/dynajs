// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-greedy

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(.+)(.?)$/);
  if (b) {
    // @witness __test_symbolic__("Hello world yanky doodle")
    __IS_SAT__(b[1] === "Hello world yanky doodle", true);
  }
}

__test_symbolic__(__symbolic__("s", "Hello world yanky doodle"));
