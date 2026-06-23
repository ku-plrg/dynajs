// @type concolic
// @target es6+ logical-assignment
// @feature syntax logical-assignment

function __test_symbolic__(symbolic) {
    if (symbolic === 5) {
      var laa_y = 1;
      laa_y &&= symbolic;
      // @witness the symbolic === 5 guard forces laa_y === 5
      __IS_SAT__(laa_y !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
