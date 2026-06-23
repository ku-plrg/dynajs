// @type concolic
// @target es5 bitwise
// @feature syntax bitwise

function __test_symbolic__(symbolic) {
    if ((symbolic | 0) === 5) {
      // @witness the (symbolic | 0) === 5 guard forces symbolic === 5
      __IS_SAT__(symbolic !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
