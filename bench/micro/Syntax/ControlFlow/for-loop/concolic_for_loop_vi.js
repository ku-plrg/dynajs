// @type concolic
// @target es5 for-loop
// @feature syntax for-loop

function __test_symbolic__(symbolic) {
    var fl_vi_sum = 0;
    for (var fl_j = 0; fl_j < 3; fl_j++) {
      fl_vi_sum = fl_vi_sum + symbolic;
    }
    if (symbolic > 0) {
      // @witness __test_symbolic__(2)
      __IS_SAT__(fl_vi_sum !== 6, true);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
