// @type concolic
// @target es5 Object.getOwnPropertyNames
// @feature builtin getownpropertynames

function __test_symbolic__(symbolic) {
  var o = { a: 1, b: 2 };
  if (symbolic.length >= 1) {
    // @witness o has exactly two own property names, so the count is 2 and never differs
    __IS_SAT__(Object.getOwnPropertyNames(o).length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "x"));
