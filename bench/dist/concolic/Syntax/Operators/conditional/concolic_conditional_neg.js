// @type concolic
// @target es5 ternary
// @feature syntax conditional

function __test_symbolic__(symbolic) {
    var tn_neg_r = symbolic > 0 ? symbolic : -symbolic;
    if (symbolic < 0) {
      // @witness the symbolic < 0 guard forces tn_neg_r > 0
      __IS_SAT__(tn_neg_r <= 0, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', -3));
