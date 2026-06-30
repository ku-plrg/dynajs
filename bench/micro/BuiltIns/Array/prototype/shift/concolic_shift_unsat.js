// @type concolic
// @target es5 Array.prototype.shift
// @feature builtin shift
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic.shift() === 1) {
    // @witness shift removes the first element of a length-2 array, leaving length exactly 1
    __IS_SAT__(symbolic.length !== 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
