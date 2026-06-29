// @type concolic
// @target es5 Object.prototype.valueOf
// @feature builtin valueof

function __test_symbolic__(symbolic) {
  var o = {};
  var t = symbolic > 0 ? o : {};
  if (o.valueOf() === t) {
    // @witness valueOf returns the object itself, so it equals t only on the symbolic > 0 branch where t is o
    __IS_SAT__(symbolic <= 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));
