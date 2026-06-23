// @type taint
// @target es6+ for-of
// @feature syntax for-of
// Iterating a tainted string with `for...of` yields its characters; each
// char carries the string's taint, so the bound loop value is tainted.

function __test_taint__(tainted) {
    var tos_first;
    for (var tos_c of tainted) {
      tos_first = tos_c;
      break;
    }
    __assert_taint__(tos_first, true);
}

__test_taint__(__set_taint__("tv"));
