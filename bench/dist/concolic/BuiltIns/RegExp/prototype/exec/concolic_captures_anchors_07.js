// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-exec-captures-anchors

function __test_symbolic__(symbolic) {
  var b = /(a)(b)(c)/.exec(symbolic);
  if (b) {
    // @witness the full match b[0] is always exactly "abc", so it can never equal the longer "abchello"
    __IS_SAT__(b[0] === "abchello", false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
