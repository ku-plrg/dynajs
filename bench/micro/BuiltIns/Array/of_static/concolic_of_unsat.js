// @type concolic
// @target es6+ Array.of
// @feature builtin of

function __test_symbolic__(symbolic) {
  if (symbolic.length === 1) {
    var r = Array.of(symbolic[0], 9);
    // @witness Array.of with two arguments always builds a length-2 array
    __IS_SAT__(r.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [3]));
