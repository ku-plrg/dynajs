// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-multiple-locked

function __test_symbolic__(symbolic) {
  var b = /(abc)(d)/.exec(symbolic);
  if (b) {
    // @witness group 1 always captures the literal "abc", so it can never differ from "abc"
    __IS_SAT__(b[1] !== "abc", false);
  }
}

__test_symbolic__(__symbolic__("s", "abcd"));
