// @type concolic
// @target es6+ Object.values
// @feature builtin values

function __test_symbolic__(symbolic) {
  var o = { a: 1, b: 2 };
  if (symbolic.length >= 1) {
    // @witness o has exactly two own enumerable props, so Object.values length is 2, never not-2
    __IS_SAT__(Object.values(o).length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', "x"));
