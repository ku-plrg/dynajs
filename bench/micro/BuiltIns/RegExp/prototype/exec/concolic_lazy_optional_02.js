// @type concolic
// @target es5 RegExp.prototype.exec
// @feature builtin regexp-quantifier

function __test_symbolic__(symbolic) {
  var b = /^a*?(a)?$/.exec(symbolic);
  if (b != null) {
    // @witness __test_symbolic__("a")
    __IS_SAT__(b[1], true);
  }
}

__test_symbolic__(__symbolic__('s', "aa"));
