// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-related

function __test_symbolic__(symbolic) {
  var b = /^(.+)q(.+)$/.exec(symbolic);
  if (b) {
    // @witness __test_symbolic__("aqa")
    __IS_SAT__(b[1] === b[2], true);
  }
}

__test_symbolic__(__symbolic__("s", "aqaaqa"));
