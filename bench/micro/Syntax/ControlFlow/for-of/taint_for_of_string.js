// @type taint
// @target es6+ for-of
// @feature syntax for-of
// @done

function __test_taint__(tainted) {
    var tos_first = "";
    for (var tos_c of tainted) {
      tos_first = tos_first + tos_c;
      break;
    }
    // @witness __test_taint__("xxx") => tos_first = "xxx"
    __assert_taint__(tos_first, true);
}

__test_taint__(__set_taint__("tv"));
