// @type concolic
// @target es5 while-loop
// @feature syntax while-loop

function __test_symbolic__(symbolic) {
    var wl_sum = 0;
    var wl_i = 0;
    while (wl_i < 3) {
      wl_sum = wl_sum + symbolic;
      wl_i = wl_i + 1;
    }
    if (symbolic === 2) {
      // @witness the symbolic === 2 guard forces wl_sum === 6
      __IS_SAT__(wl_sum !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
