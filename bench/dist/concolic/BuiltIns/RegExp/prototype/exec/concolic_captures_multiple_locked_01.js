// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-multiple-locked

function __test_symbolic__(symbolic) {
  var b = /(abc)(d)/.exec(symbolic);
  if (b) {
    // @witness the full match b[0] is always exactly "abcd", so it can never differ from "abcd"
    __IS_SAT__(b[0] !== "abcd", false);
  }
}

__test_symbolic__(__symbolic__("s", "abcd"));
