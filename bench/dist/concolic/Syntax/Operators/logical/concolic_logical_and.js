// @type concolic
// @target es5 logical
// @feature syntax logical

function __test_symbolic__(symbolic) {
    if (symbolic > 3 && symbolic < 10) {
      // @witness the symbolic > 3 && symbolic < 10 guard forces symbolic >= 4
      __IS_SAT__(symbolic < 4, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 7));
