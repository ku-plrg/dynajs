// @type concolic
// @target es6+ Array.prototype.includes
// @feature builtin includes
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.includes(5)) {
    // @witness includes(5) holds only if an element exists, so the array is non-empty
    __IS_SAT__(symbolic.length < 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
