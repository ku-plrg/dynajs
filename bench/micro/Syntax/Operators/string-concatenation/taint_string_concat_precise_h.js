// @type taint
// @target es5 string-concatenation
// @feature syntax string-concatenation
// Per-character precision: a tainted char stays tainted at its exact index in
// the concatenated result while surrounding literal chars stay clean. The
// string's .length is a clean number even when some chars are tainted.

function __test_taint__(tainted) {
    var tsp_a = tainted + "ello";
    // @witness __test_taint__('x') => r[0] tainted from tainted operand
    __assert_taint__(tsp_a, true);
    // @witness __test_taint__('x') => r[0] = 'x' tainted
    __assert_taint__(tsp_a[0], true);
    // @witness r[1] = 'e' clean literal
    __assert_taint__(tsp_a[1], false);
    // @witness r[4] = 'o' clean literal
    __assert_taint__(tsp_a[4], false);
    // @witness boolean/length result, clean
    __assert_taint__(tsp_a.length, false);
}

__test_taint__(__set_taint__("H"));
