// @type concolic
// @target es5 while-loop
// @feature syntax while-loop

function __test_symbolic__(symbolic) {
    var wl_vsum = 0;
    var wl_j = 0;
    while (wl_j < 3) {
      wl_vsum = wl_vsum + symbolic;
      wl_j = wl_j + 1;
    }
    if (symbolic > 0) {
      // @witness __test_symbolic__(2)
      __IS_SAT__(wl_vsum !== 6, true);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
