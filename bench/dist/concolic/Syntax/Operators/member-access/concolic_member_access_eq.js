// @type concolic
// @target es6+ member-access
// @feature syntax member-access

function __test_symbolic__(symbolic) {
    var ma_o2 = { f: symbolic };
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces ma_o2["f"] === ma_o2.f
      __IS_SAT__(ma_o2["f"] !== ma_o2.f, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
