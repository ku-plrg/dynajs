// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^(a)+?a?$/.exec(symbolic);
  if (b != null) {
    // @witness the (a)+? group requires at least one "a", so b[1] is always the truthy string "a" whenever b != null
    __IS_SAT__(!(!!b[1]), false);
  }
}

__test_symbolic__(__symbolic__('s', "a"));
