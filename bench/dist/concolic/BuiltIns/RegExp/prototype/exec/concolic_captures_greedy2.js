// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-singlechar

function __test_symbolic__(symbolic) {
  var b = /^([a-z])$/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("a")
    __IS_SAT__(b[1] === "a", true);
  }
}

__test_symbolic__(__symbolic__("s", "b"));
