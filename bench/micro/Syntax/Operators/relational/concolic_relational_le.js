// @type concolic
// @target es5 relational
// @feature syntax relational

function __test_symbolic__(symbolic) {
    if (symbolic <= 0) {
      // @witness the symbolic <= 0 guard forces symbolic < 1
      __IS_SAT__(symbolic >= 1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 0));
