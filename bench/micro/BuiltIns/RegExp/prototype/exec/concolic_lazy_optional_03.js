// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^a*?(a)?$/.exec(symbolic);
  if (b != null) {
    // @witness lazy a*? leaves the trailing a to (a)?, so b[1] is always either "a" or undefined; the disjunction holds on every matching path
    __IS_SAT__(!(b[1] === "a" || !b[1]), false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
