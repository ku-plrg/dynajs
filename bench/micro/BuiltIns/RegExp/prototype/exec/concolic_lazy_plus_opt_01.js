// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^(a)+?a?$/.exec(symbolic);
  if (b != null) {
    if (symbolic === "a") {
      // @witness under symbolic === "a", exec matches "a" and pins capture group 1 to "a", so b[1] !== "a" is impossible
      __IS_SAT__(b[1] !== "a", false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "a"));
