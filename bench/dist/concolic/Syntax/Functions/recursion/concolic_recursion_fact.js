// @type concolic
// @target es5 recursion
// @feature syntax recursion

function rc_factorial(n) {
  return n <= 1 ? 1 : n * rc_factorial(n - 1);
}

function __test_symbolic__(symbolic) {
    if (symbolic === 3) {
      // @witness the symbolic === 3 guard forces rc_factorial(symbolic) === 6
      __IS_SAT__(rc_factorial(symbolic) !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 3));
