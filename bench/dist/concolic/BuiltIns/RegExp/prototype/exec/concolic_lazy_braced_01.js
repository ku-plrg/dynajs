// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^(a{1,3}?)(a)?$/.exec(symbolic);
  if (b != null) {
    if (symbolic === "a") {
      // @witness the guard pins symbolic to "a", so a{1,3}? lazily captures that single "a" into group 1; b[1] is always "a" and !b[1] can never hold
      __IS_SAT__(!b[1], false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "a"));
