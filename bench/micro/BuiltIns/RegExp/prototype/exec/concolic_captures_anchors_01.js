// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-anchors

function __test_symbolic__(symbolic) {
  var b = /(a)(b)(c)/.exec(symbolic);
  if (b) {
    // @witness on a successful match group 1 always captures the literal "a", so it can never differ from "a"
    __IS_SAT__(b[1] !== "a", false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
