// @type taint
// @target es6+ for-of
// @feature syntax for-of

function __test_taint__(tainted) {
    var to_arr = [tainted, "clean"];
    var to_first;
    for (var to_v of to_arr) {
      to_first = to_v;
      break;
    }
    __assert_taint__(to_first, true);
}

__test_taint__(__set_taint__("tv"));
