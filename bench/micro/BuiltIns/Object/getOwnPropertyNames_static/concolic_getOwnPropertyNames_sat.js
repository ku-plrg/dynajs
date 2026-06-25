// @type concolic
// @target es5 Object.getOwnPropertyNames
// @feature builtin getownpropertynames

function __test_symbolic__(symbolic) {
  var o = { x: symbolic };
  // @witness __test_symbolic__(1)
  __IS_SAT__(Object.getOwnPropertyNames(o).length === symbolic, true);
}

__test_symbolic__(__symbolic__('s', 3));
