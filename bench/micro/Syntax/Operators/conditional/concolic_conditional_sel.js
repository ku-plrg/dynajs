// @type concolic
// @target es5 ternary
// @feature syntax conditional

function __test_symbolic__(symbolic) {
    var tn_sel_r = symbolic > 0 ? 1 : -1;
    if (symbolic > 0) {
      // @witness the symbolic > 0 guard forces tn_sel_r === 1
      __IS_SAT__(tn_sel_r !== 1, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 4));
