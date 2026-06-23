// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-anchors

function __test_symbolic__(symbolic) {
  var b = /(a)(b)(c)/.exec(symbolic);
  if (b) {
    // @witness on a successful match group 2 always captures the literal "b", so it can never differ from "b"
    __IS_SAT__(b[2] !== "b", false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
