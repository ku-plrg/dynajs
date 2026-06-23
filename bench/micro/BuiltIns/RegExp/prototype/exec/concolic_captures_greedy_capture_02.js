// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-greedy

function __test_symbolic__(symbolic) {
  var b = /^(.+)(.?)$/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("Hello world yanky doodle")
    __IS_SAT__(b[1] === "Hello world yanky doodle", true);
  }
}

__test_symbolic__(__symbolic__("x", "Hello world yanky doodle"));
