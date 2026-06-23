// @type concolic
// @target es5 bitwise
// @feature syntax bitwise

function __test_symbolic__(symbolic) {
    if ((symbolic << 1) === 4) {
      // @witness the (symbolic << 1) === 4 guard forces symbolic === 2
      __IS_SAT__(symbolic !== 2, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 2));
