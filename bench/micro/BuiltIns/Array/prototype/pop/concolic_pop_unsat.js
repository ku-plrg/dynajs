// @type concolic
// @target es5 Array.prototype.pop
// @feature builtin pop
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.length === 2 && symbolic.pop() === 9) {
    // @witness pop removes the last element of a length-2 array, leaving length exactly 1
    __IS_SAT__(symbolic.length !== 1, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 9]));
