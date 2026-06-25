// @type concolic
// @target es5 Array.prototype.push
// @feature builtin push
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.push(7) === 3) {
    // @witness push returns the new length; a return of 3 means the array now has length 3
    __IS_SAT__(symbolic.length !== 3, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
