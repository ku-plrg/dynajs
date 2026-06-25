// @type concolic
// @target es5 Array.prototype.reverse
// @feature builtin reverse
// @done

function __test_symbolic__(symbolic) {
  if (symbolic.reverse().length === 2) {
    // @witness reverse does not change the length of the array
    __IS_SAT__(symbolic.length !== 2, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
