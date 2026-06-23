// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-simple

function __test_symbolic__(symbolic) {
  var b = /(a)/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("abcabcabcabcabca")
    __IS_SAT__(symbolic === "abcabcabcabcabca", true);
  }
}

__test_symbolic__(__symbolic__("s", "abcabcabcabcabca"));
