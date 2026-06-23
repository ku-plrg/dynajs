// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-multiple-locked

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(abc)(d)/);
  if (b) {
    // @witness the second capture group (d) is a literal, so b[2] can only be "d"
    __IS_SAT__(b[2] !== "d", false);
  }
}

__test_symbolic__(__symbolic__('s', "abcd"));
