// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-greedy

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/^(.+)(.?)$/);
  if (b) {
    // @witness greedy (.+) consumes the entire line, so the optional (.?) always captures "" and b[2] !== "" is impossible
    __IS_SAT__(b[2] !== "", false);
  }
}

__test_symbolic__(__symbolic__("s", "Hello world yanky doodle"));
