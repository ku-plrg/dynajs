// @type concolic
// @target es5 recursion
// @feature syntax recursion

function rc_sumdown(n) {
  return n <= 0 ? 0 : n + rc_sumdown(n - 1);
}

function __test_symbolic__(symbolic) {
    if (symbolic === 3) {
      // @witness the symbolic === 3 guard forces rc_sumdown(symbolic) === 6
      __IS_SAT__(rc_sumdown(symbolic) !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 3));
