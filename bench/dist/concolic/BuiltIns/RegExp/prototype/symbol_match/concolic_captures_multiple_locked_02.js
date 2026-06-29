// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-multiple-locked

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(abc)(d)/);
  if (b) {
    // @witness the first capture group (abc) is a literal, so b[1] can only be "abc"
    __IS_SAT__(b[1] !== "abc", false);
  }
}

__test_symbolic__(__symbolic__('s', "abcd"));
