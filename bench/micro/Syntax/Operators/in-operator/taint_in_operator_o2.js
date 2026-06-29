// @type taint
// @target es6+ in-operator
// @feature syntax in-operator

function __test_taint__(tainted) {
    var in_o2 = {};
    // @witness boolean result, clean
    __assert_taint__("k" in in_o2, false);
}

__test_taint__(__set_taint__("x"));
