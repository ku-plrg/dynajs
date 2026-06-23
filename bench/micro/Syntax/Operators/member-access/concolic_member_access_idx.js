// @type concolic
// @target es6+ member-access
// @feature syntax member-access

function __test_symbolic__(symbolic) {
    var ma_arr = [symbolic];
    if (symbolic === 5) {
      // @witness the symbolic === 5 guard forces ma_arr[0] === 5
      __IS_SAT__(ma_arr[0] !== 5, false);
    } else {
      __IS_SAT__(true, false);
    }
}

__test_symbolic__(__symbolic__('s', 5));
