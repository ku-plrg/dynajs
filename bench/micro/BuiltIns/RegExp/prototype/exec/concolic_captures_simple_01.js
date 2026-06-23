// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-simple

function __test_symbolic__(symbolic) {
  var b = /(a)/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("aaaabaa")
    __IS_SAT__(symbolic === "aaaabaa", true);
  }
}

__test_symbolic__(__symbolic__("s", "aaaabaa"));
