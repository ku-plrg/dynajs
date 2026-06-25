// @type concolic
// @target es5 Array.length
// @feature builtin length

function __test_symbolic__(symbolic) {
  if (symbolic.push(7) === 2) {
    // @witness push returns the new length; a return of 2 means the array now has length 2
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [5]));
