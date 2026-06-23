// @type concolic
// @target es5 compound-assignment
// @feature syntax compound-assignment

function __test_symbolic__(symbolic) {
    if (symbolic === 4) {
      symbolic += 3;
      // @witness the symbolic === 4 guard forces symbolic === 7
      __IS_SAT__(symbolic !== 7, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 4));
