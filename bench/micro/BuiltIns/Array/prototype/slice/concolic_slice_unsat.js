// @type concolic
// @target es5 Array.prototype.slice
// @feature builtin slice
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.slice(1)[0] === 7) {
    // @witness slice(1) begins at index 1, so its first element is symbolic[1]
    __IS_SAT__(symbolic[1] !== 7, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 7]));
