// @type concolic
// @target es5 relational
// @feature syntax relational

function __test_symbolic__(symbolic) {
    if (symbolic >= 3) {
      // @witness the symbolic >= 3 guard forces symbolic > 2
      __IS_SAT__(symbolic <= 2, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
