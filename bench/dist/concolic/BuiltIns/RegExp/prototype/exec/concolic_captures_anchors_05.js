// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-anchors

function __test_symbolic__(symbolic) {
  var b = /(a)(b)(c)/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("abchello")
    __IS_SAT__(symbolic === "abchello", true);
  }
}

__test_symbolic__(__symbolic__("s", "abchelloabchello"));
