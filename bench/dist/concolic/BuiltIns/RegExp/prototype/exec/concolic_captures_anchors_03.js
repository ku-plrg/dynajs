// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-anchors

function __test_symbolic__(symbolic) {
  var b = /(a)(b)(c)/.exec(symbolic);
  if (b) {
    // @witness on a successful match group 3 always captures the literal "c", so it can never differ from "c"
    __IS_SAT__(b[3] !== "c", false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
