// @type concolic
// @target es5 unary
// @feature syntax unary

function __test_symbolic__(symbolic) {
    if (symbolic > 0) {
      // @witness the symbolic > 0 guard forces -symbolic < 0
      __IS_SAT__(-symbolic >= 0, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
