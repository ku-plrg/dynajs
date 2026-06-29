// @type concolic
// @target es5 for-loop
// @feature syntax for-loop

function __test_symbolic__(symbolic) {
    var fl_acc_sum = 0;
    for (var fl_i = 0; fl_i < 3; fl_i++) {
      fl_acc_sum = fl_acc_sum + symbolic;
    }
    if (symbolic === 2) {
      // @witness the symbolic === 2 guard forces fl_acc_sum === 6
      __IS_SAT__(fl_acc_sum !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
