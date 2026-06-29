// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^(a{1,3}?)(a)?$/.exec(symbolic);
  if (b != null) {
    if (symbolic === "a") {
      // @witness with symbolic === "a" the lone "a" is consumed by group 1, leaving nothing for optional (a)?, so b[2] is always undefined and can never be truthy
      __IS_SAT__(b[2], false);
    }
  }
}

__test_symbolic__(__symbolic__('s', "a"));
