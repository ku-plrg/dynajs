// @type concolic
// @target es5 compound-assignment
// @feature syntax compound-assignment

function __test_symbolic__(symbolic) {
    if (symbolic === 10) {
      symbolic -= 4;
      // @witness the symbolic === 10 guard forces symbolic === 6
      __IS_SAT__(symbolic !== 6, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 10));
