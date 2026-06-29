// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^(a)+?a$/.exec(symbolic);
  if (b != null) {
    // @witness /^(a)+?a$/ needs one-or-more "a" then a trailing "a", so any match is at least "aa"; the single char "a" fails the guard, so symbolic === "a" is impossible here
    __IS_SAT__(symbolic === "a", false);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
