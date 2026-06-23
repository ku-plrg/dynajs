// @type concolic
// @target es5 arithmetic
// @feature syntax arithmetic

function __test_symbolic__(symbolic) {
    if (symbolic * 2 === 14) {
      // @witness the symbolic * 2 === 14 guard forces symbolic === 7
      __IS_SAT__(symbolic !== 7, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
