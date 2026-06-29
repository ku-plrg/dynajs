// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-greedy

function __test_symbolic__(symbolic) {
  var b = /^(.+)(.?)$/.exec(symbolic);
  if (b) {
    // @witness greedy (.+) consumes the entire string so the optional (.?) always matches empty, leaving b[2] permanently ""
    __IS_SAT__(b[2] !== "", false);
  }
}

__test_symbolic__(__symbolic__("x", "Hello world yanky doodle"));
