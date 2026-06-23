// @type concolic
// @target es5 String.prototype.match
// @feature builtin regexp-match-captures-simple

function __test_symbolic__(symbolic) {
  var b = symbolic.match(/(a)/);
  if (b) {
    // @witness /(a)/ matches only the literal "a", so b[0] and b[1] are always "a" on any match
    __IS_SAT__(!(b[0] === "a" && b[1] === "a"), false);
  }
}

__test_symbolic__(__symbolic__("x", "a"));
