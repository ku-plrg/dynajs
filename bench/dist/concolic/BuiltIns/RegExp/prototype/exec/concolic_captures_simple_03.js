// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-simple

function __test_symbolic__(symbolic) {
  var b = /(a)/.exec(symbolic);
  if (b) {
    // @witness on a successful /(a)/ match the full match b[0] and group b[1] are both always the literal "a", so the conjunction can never be false
    __IS_SAT__(!(b[0] === "a" && b[1] === "a"), false);
  }
}

__test_symbolic__(__symbolic__("s", "a"));
