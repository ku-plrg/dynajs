// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-multiple-locked

function __test_symbolic__(symbolic) {
  var b = /(abc)(d)/.exec(symbolic);
  if (b) {
    // @witness group 2 always captures the literal "d", so it can never differ from "d"
    __IS_SAT__(b[2] !== "d", false);
  }
}

__test_symbolic__(__symbolic__("s", "abcd"));
