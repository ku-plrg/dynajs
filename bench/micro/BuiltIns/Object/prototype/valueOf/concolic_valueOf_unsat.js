// @type concolic
// @target es5 Object.prototype.valueOf
// @feature builtin valueof

function __test_symbolic__(symbolic) {
  var o = { v: 1 };
  if (symbolic > 0) {
    // @witness valueOf on a plain object returns the object itself, so it can never differ from o
    __IS_SAT__(o.valueOf() !== o, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', 5));
