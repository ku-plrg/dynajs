// @type concolic
// @target es5 Array.prototype.unshift
// @feature builtin unshift

function __test_symbolic__(symbolic) {
  if (symbolic.unshift(0) === 3) {
    // @witness unshift prepends 0 (returning the new length 3), so index 0 becomes 0
    __IS_SAT__(symbolic[0] !== 0, false);
  } else {
    __IS_SAT__(true, false);
  }
}

__test_symbolic__(__symbolic__('s', [1, 2]));
