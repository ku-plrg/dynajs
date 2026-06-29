// @type concolic
// @target es5 ternary
// @feature syntax conditional

function __test_symbolic__(symbolic) {
    var tn_abs_r = symbolic > 0 ? symbolic : -symbolic;
    if (symbolic > 0) {
      // @witness the symbolic > 0 guard forces tn_abs_r === symbolic
      __IS_SAT__(tn_abs_r !== symbolic, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 4));
