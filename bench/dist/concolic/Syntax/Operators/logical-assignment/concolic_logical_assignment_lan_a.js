// @type concolic
// @target es6+ logical-assignment
// @feature syntax logical-assignment

function __test_symbolic__(symbolic) {
    if (symbolic === 5) {
      var lan_x = null;
      lan_x ??= symbolic;
      // @witness the symbolic === 5 guard forces lan_x === 5
      __IS_SAT__(lan_x !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
