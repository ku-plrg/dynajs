// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-anchors

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(a)(b)(c)/);
  if (b) {
    // @witness capture group 3 of /(a)(b)(c)/ always equals "c", so b[3] !== "c" is impossible
    __IS_SAT__(b[3] !== "c", false);
  }
}

__test_symbolic__(__symbolic__("s", "abc"));
