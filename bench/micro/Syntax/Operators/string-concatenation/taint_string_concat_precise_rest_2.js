// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation
// Per-character precision: a tainted char stays tainted at its exact index in
// the concatenated result while surrounding literal chars stay clean. The
// string's .length is a clean number even when some chars are tainted.

function __test_taint__(tainted) {
    var tsp_x = "H" + tainted;
    // @witness __test_taint__('x') => r[1] = 'x' tainted
    __assert_taint__(tsp_x[1], true);
}

__test_taint__(__set_taint__("ello"));
